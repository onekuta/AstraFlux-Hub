/**
 * 星闪驱动云端更新与离线库升级服务 (只读客户端模式)
 * 安全原则：
 * 客户端严禁存储任何云端写操作 Token 或密钥！只执行公开的只读 HTTP GET 检查。
 * 数据库更新与软件本体更新物理隔离：
 * - 数据库更新专属目录：database/ (database/manifest.json, database/device_database.spkdb)
 * - 软件本体更新专属目录：software/ (software/manifest.json)
 */

import { customDeviceRegistry } from './customDeviceRegistry.js';
import JSZip from 'jszip';

const UPDATER_SETTINGS_KEY = 'SPARKLINK_OTA_UPDATER_SETTINGS_V2';

// 默认预留的云端直链 (完全分离 database 与 software 独立目录，包含正式版与 Beta 测试版通道)
const DEFAULT_DB_URL = 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/database/manifest.json';
const DEFAULT_APP_URL = 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/software/manifest.json';
const DEFAULT_BETA_APP_URL = 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/software(beta)/manifest.json';
const DEFAULT_MANIFEST_URL = 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/manifest.json';
const GITEE_RELEASES_PAGE = 'https://gitee.com/Kutaze/astra-flux-hub/releases';
const GITHUB_RELEASES_PAGE = 'https://github.com/onekuta/AstraFlux-Hub/releases';

const CURRENT_APP_VERSION = '1.1.3';
const CURRENT_APP_BUILD_TIMECODE = '26.10.23';
const DEFAULT_LIB_VERSION = '2026.10.20.1';

// 计算当前日期的默认 Beta 版本号格式：beta0.YY.MM.DD
export function getFormattedBetaVersion(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `beta0.${yy}.${mm}.${dd}`;
}

// 解析任意版本字符串或日期格式为整数时间码 (如 "26.10.23" -> 261023, "beta0.26.10.23" -> 261023, "2026-10-23" -> 261023)
export function parseTimeCode(val) {
  if (!val) return 0;
  const s = String(val).trim();
  // 1. beta0.YY.MM.DD 或 beta.YY.MM.DD
  const betaM = s.match(/beta\d*[\.-](\d{2})\.(\d{1,2})\.(\d{1,2})/i);
  if (betaM) {
    return parseInt(`${betaM[1].padStart(2, '0')}${betaM[2].padStart(2, '0')}${betaM[3].padStart(2, '0')}`, 10);
  }
  // 2. YY.MM.DD 或 20YY.MM.DD
  const dotM = s.match(/(?:20)?(\d{2})\.(\d{1,2})\.(\d{1,2})/);
  if (dotM) {
    return parseInt(`${dotM[1].padStart(2, '0')}${dotM[2].padStart(2, '0')}${dotM[3].padStart(2, '0')}`, 10);
  }
  // 3. 20YY-MM-DD 或 ISO 字符串
  const dashM = s.match(/(?:20)?(\d{2})-(\d{1,2})-(\d{1,2})/);
  if (dashM) {
    return parseInt(`${dashM[1].padStart(2, '0')}${dashM[2].padStart(2, '0')}${dashM[3].padStart(2, '0')}`, 10);
  }
  return 0;
}

// 将整数时间码或日期还原为标准 YY.MM.DD 显示格式
export function formatTimeCode(val) {
  if (!val) return '';
  const num = typeof val === 'number' ? val : parseTimeCode(val);
  if (!num) return String(val);
  const s = String(num).padStart(6, '0');
  return `${s.slice(0, 2)}.${s.slice(2, 4)}.${s.slice(4, 6)}`;
}

// 语义化版本号比对工具 (v1.1.1 > v1.1.0)
function compareSemver(v1, v2) {
  if (!v1 || !v2) return 0;
  const clean1 = (String(v1).trim().replace(/^[vV]/, '')).split('.').map(n => parseInt(n, 10) || 0);
  const clean2 = (String(v2).trim().replace(/^[vV]/, '')).split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(clean1.length, clean2.length); i++) {
    const num1 = clean1[i] || 0;
    const num2 = clean2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

// 版本更新可用性判定：根据当前渠道 (release 或 beta) 判定是否有新版本，严格防止倒退与回退
export function compareAppVersions(cloudVer, localVer, channel = 'release', cloudManifest = null, localTimeCode = CURRENT_APP_BUILD_TIMECODE) {
  if (!cloudVer) {
    return { hasUpdate: false, reason: 'no_cloud_version' };
  }
  const sCloud = String(cloudVer).trim();
  const sLocal = String(localVer || '').trim();
  const isLocalBeta = sLocal.toLowerCase().startsWith('beta');

  // 提取云端与本地的时间码 (整数，可直接比大小)
  const cloudTimeCodeRaw = cloudManifest?.buildTimeCode || cloudManifest?.buildDate || sCloud;
  const cloudTimeNum = parseTimeCode(cloudTimeCodeRaw) || parseTimeCode(cloudManifest?.updatedAt);
  const localTimeNum = parseTimeCode(localTimeCode) || (isLocalBeta ? parseTimeCode(sLocal) : parseTimeCode(CURRENT_APP_BUILD_TIMECODE));

  if (channel === 'beta') {
    // 场景 A：本地当前运行的是【正式稳定版】
    if (!isLocalBeta) {
      // 业务硬性门禁规则：
      // 如果当前本地正式版的时间码 比 云端 Beta 的时间码更近（或同一天最新），
      // 说明正式版已吸收或超越了此 Beta 版本，坚决禁止“升级”（实质为倒退）至旧 Beta 版本！
      if (cloudTimeNum <= localTimeNum) {
        return {
          hasUpdate: false,
          isBlockedByNewerOfficial: true,
          blockReason: `当前正式稳定版构建时间（${formatTimeCode(localTimeNum)}）比云端 Beta 版本（${formatTimeCode(cloudTimeNum) || sCloud}）更新或同等最新，不支持更新/回退至旧 Beta 版本`,
          cloudTimeCode: formatTimeCode(cloudTimeNum),
          localTimeCode: formatTimeCode(localTimeNum),
        };
      }
      // 云端 Beta 构建时间严格新于当前正式稳定版 -> 允许升级体验
      return {
        hasUpdate: true,
        cloudTimeCode: formatTimeCode(cloudTimeNum),
        localTimeCode: formatTimeCode(localTimeNum),
      };
    }

    // 场景 B：本地运行的已经是【Beta 测试版】
    // 此时两者皆为 Beta，仅当云端 Beta 时间码严格大于本地已安装的 Beta 时间码时才允许更新
    if (cloudTimeNum > localTimeNum) {
      return {
        hasUpdate: true,
        cloudTimeCode: formatTimeCode(cloudTimeNum),
        localTimeCode: formatTimeCode(localTimeNum),
      };
    }
    return {
      hasUpdate: false,
      reason: 'already_latest_beta',
      cloudTimeCode: formatTimeCode(cloudTimeNum),
      localTimeCode: formatTimeCode(localTimeNum),
    };
  }

  // 正式版渠道 (release)
  if (isLocalBeta) {
    // 已安装 Beta 测试版的用户切换回正式版渠道：
    // 若云端正式版更新了，且时间码新于当前本地 Beta，允许回归最新正式版
    if (cloudTimeNum > localTimeNum) {
      return {
        hasUpdate: true,
        cloudTimeCode: formatTimeCode(cloudTimeNum),
        localTimeCode: formatTimeCode(localTimeNum),
      };
    }
    // 否则已安装 Beta 版本无法向后回退至老正式版
    return {
      hasUpdate: false,
      cannotDowngradeFromBeta: true,
      reason: 'beta_cannot_downgrade_to_older_release',
      cloudTimeCode: formatTimeCode(cloudTimeNum),
      localTimeCode: formatTimeCode(localTimeNum),
    };
  }

  // 本地是正式版，云端是正式版：优先语义化版本号，若版本号相同则比对构建时间码 (用于同版本修复构建)
  const semverDiff = compareSemver(sCloud, sLocal);
  if (semverDiff > 0) {
    return {
      hasUpdate: true,
      cloudTimeCode: formatTimeCode(cloudTimeNum),
      localTimeCode: formatTimeCode(localTimeNum),
    };
  } else if (semverDiff === 0 && cloudTimeNum > localTimeNum) {
    return {
      hasUpdate: true,
      isHotfix: true,
      cloudTimeCode: formatTimeCode(cloudTimeNum),
      localTimeCode: formatTimeCode(localTimeNum),
    };
  }

  return {
    hasUpdate: false,
    reason: 'already_latest_release',
    cloudTimeCode: formatTimeCode(cloudTimeNum),
    localTimeCode: formatTimeCode(localTimeNum),
  };
}

// 保持向下兼容的老函数名
function compareVersions(cloudVer, localVer, channel = 'release', cloudManifest = null, localTimeCode = CURRENT_APP_BUILD_TIMECODE) {
  return compareAppVersions(cloudVer, localVer, channel, cloudManifest, localTimeCode).hasUpdate;
}

class UpdaterService {
  constructor() {
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(UPDATER_SETTINGS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // 自动纠偏旧版缓存中残留的 /raw/master/ 分支链接至 /raw/main/
          if (parsed.manifestUrl?.includes('/raw/master/')) {
            parsed.manifestUrl = parsed.manifestUrl.replace('/raw/master/', '/raw/main/');
          }
          if (parsed.dbUpdateUrl?.includes('/raw/master/')) {
            parsed.dbUpdateUrl = parsed.dbUpdateUrl.replace('/raw/master/', '/raw/main/');
          }
          if (parsed.appUpdateUrl?.includes('/raw/master/')) {
            parsed.appUpdateUrl = parsed.appUpdateUrl.replace('/raw/master/', '/raw/main/');
          }

          // 纠偏：如果 appUpdateUrl 或 dbUpdateUrl 指向了混杂的根目录 manifest.json，自动矫正为物理隔离目录
          const cleanAppUrl = (parsed.appUpdateUrl && !parsed.appUpdateUrl.includes('your_account') && !parsed.appUpdateUrl.endsWith('/raw/main/manifest.json'))
            ? parsed.appUpdateUrl.trim()
            : DEFAULT_APP_URL;

          const cleanDbUrl = (parsed.dbUpdateUrl && !parsed.dbUpdateUrl.includes('your_account') && !parsed.dbUpdateUrl.endsWith('/raw/main/manifest.json'))
            ? parsed.dbUpdateUrl.trim()
            : DEFAULT_DB_URL;

          const cleanBetaAppUrl = (parsed.betaAppUpdateUrl && !parsed.betaAppUpdateUrl.includes('your_account'))
            ? parsed.betaAppUpdateUrl.trim()
            : DEFAULT_BETA_APP_URL;

          return {
            manifestUrl: DEFAULT_MANIFEST_URL,
            dbUpdateUrl: cleanDbUrl,
            appUpdateUrl: cleanAppUrl,
            betaAppUpdateUrl: cleanBetaAppUrl,
            currentLibVersion: DEFAULT_LIB_VERSION,
            currentAppVersion: CURRENT_APP_VERSION,
            ...parsed,
            dbUpdateUrl: cleanDbUrl,
            appUpdateUrl: cleanAppUrl,
            betaAppUpdateUrl: cleanBetaAppUrl,
          };
        }
      }
    } catch (e) {}

    return {
      manifestUrl: DEFAULT_MANIFEST_URL,
      dbUpdateUrl: DEFAULT_DB_URL,
      appUpdateUrl: DEFAULT_APP_URL,
      betaAppUpdateUrl: DEFAULT_BETA_APP_URL,
      currentLibVersion: DEFAULT_LIB_VERSION,
      currentAppVersion: CURRENT_APP_VERSION,
    };
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(UPDATER_SETTINGS_KEY, JSON.stringify(this.settings));
      }
    } catch (e) {
      console.error('[Updater] 保存更新配置失败:', e);
    }
  }

  getManifestUrl() {
    return this.settings.manifestUrl || DEFAULT_MANIFEST_URL;
  }

  setManifestUrl(url) {
    this.saveSettings({ manifestUrl: url ? url.trim() : '' });
  }

  getDbUpdateUrl() {
    const url = (this.settings.dbUpdateUrl || '').trim();
    if (!url || url.includes('your_account') || url.endsWith('/raw/main/manifest.json')) {
      return DEFAULT_DB_URL;
    }
    return url;
  }

  setDbUpdateUrl(url) {
    this.saveSettings({ dbUpdateUrl: url ? url.trim() : '' });
  }

  getUpdateChannel() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('sparklink_hub_channel') || 'release';
      }
    } catch {}
    return 'release';
  }

  setUpdateChannel(channel) {
    if (channel === 'beta' || channel === 'release') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('sparklink_hub_channel', channel);
        }
      } catch {}
    }
  }

  getAppUpdateUrl() {
    const channel = this.getUpdateChannel();
    if (channel === 'beta') {
      return this.getBetaAppUpdateUrl();
    }
    const url = (this.settings.appUpdateUrl || '').trim();
    if (!url || url.includes('your_account') || url.endsWith('/raw/main/manifest.json')) {
      return DEFAULT_APP_URL;
    }
    return url;
  }

  setAppUpdateUrl(url) {
    this.saveSettings({ appUpdateUrl: url ? url.trim() : '' });
  }

  getBetaAppUpdateUrl() {
    const url = (this.settings.betaAppUpdateUrl || '').trim();
    if (!url || url.includes('your_account')) {
      return DEFAULT_BETA_APP_URL;
    }
    return url;
  }

  setBetaAppUpdateUrl(url) {
    this.saveSettings({ betaAppUpdateUrl: url ? url.trim() : '' });
  }

  getCurrentAppVersion() {
    const channel = this.getUpdateChannel();
    if (channel === 'beta') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const saved = window.localStorage.getItem('sparklink_hub_installed_beta_version');
          // 仅当用户真正安装升级过标准 Beta 版本时，本地版本才呈现为 Beta 格式
          if (saved && String(saved).toLowerCase().startsWith('beta')) {
            return String(saved).trim();
          }
        }
      } catch {}
      // 切换至 Beta 通道但尚未执行升级安装前，本地版本严格保持真实正式版本号 (如 1.1.2)
      return CURRENT_APP_VERSION;
    }
    return CURRENT_APP_VERSION;
  }

  // 获取当前运行客户端的构建时间码 (如 "26.10.22" 或 "26.10.23")
  getCurrentAppBuildTimeCode() {
    if (this.isCurrentVersionBeta()) {
      const ver = this.getCurrentAppVersion();
      const code = formatTimeCode(ver);
      return code || '26.10.23';
    }
    return CURRENT_APP_BUILD_TIMECODE; // '26.10.22'
  }

  // 判定当前运行的本地客户端是否已是标准 Beta 版本 (按安装后的版本号标准判定)
  isCurrentVersionBeta() {
    const ver = this.getCurrentAppVersion();
    return String(ver).toLowerCase().startsWith('beta');
  }

  // 记录已安装的标准 Beta 版本号
  recordInstalledBetaVersion(version) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('sparklink_hub_installed_beta_version', version || getFormattedBetaVersion());
        window.dispatchEvent(new CustomEvent('sparklink-update-status-refresh', { detail: { type: 'app', version } }));
      }
    } catch {}
  }

  // 清除 Beta 版本记录 (卸载重装正式版或彻底还原时)
  clearInstalledBetaVersion() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('sparklink_hub_installed_beta_version');
      }
    } catch {}
  }

  getCurrentLibVersion() {
    return this.settings.currentLibVersion || customDeviceRegistry.currentLibVersion || DEFAULT_LIB_VERSION;
  }

  // 1. 综合比对检测：对【数据库更新链接 (database/)】与【驱动更新链接 (software/)】分别进行严格独立比对
  async checkBothVersions(options = {}) {
    const dbUrl = (options.dbUrl || this.getDbUpdateUrl() || '').trim();
    const appUrl = (options.appUrl || this.getAppUpdateUrl() || '').trim();

    const currentLib = this.getCurrentLibVersion();
    const currentApp = this.getCurrentAppVersion();
    const currentBuildTime = this.getCurrentAppBuildTimeCode();

    const result = {
      configured: true,
      currentLibVersion: currentLib,
      cloudLibVersion: null,
      cloudLibTotalDevices: null,
      hasLibUpdate: false,
      libDownloadUrl: null,
      libChangelog: null,
      libError: null,

      currentAppVersion: currentApp,
      currentAppBuildTimeCode: currentBuildTime,
      cloudAppVersion: null,
      cloudAppBuildTimeCode: null,
      hasAppUpdate: false,
      isBetaBlockedByNewerOfficial: false,
      betaBlockReason: null,
      cannotDowngradeFromBeta: false,
      appDownloadUrl: null,
      appChangelog: null,
      appFileSize: null,
      appForceUpdate: false,
      appError: null,

      rawDbData: null,
      rawManifest: null,
    };

    // ----------------------------------------------------
    // 1. 独立检查【外设适配库更新】(专属于 database/ 目录)
    // ----------------------------------------------------
    const targetDbUrl = dbUrl || DEFAULT_DB_URL;
    if (targetDbUrl && !targetDbUrl.includes('your_account')) {
      try {
        if (targetDbUrl.endsWith('.json')) {
          const resp = await fetch(`${targetDbUrl}?_t=${Date.now()}`, { cache: 'no-store' });
          if (resp.ok) {
            const json = await resp.json();
            if (Array.isArray(json.profiles)) {
              result.rawDbData = json;
              result.cloudLibVersion = json.libVersion;
              result.cloudLibTotalDevices = json.totalDevices || json.profiles.length;
              result.libChangelog = json.libChangelog || json.changelog || `收录 ${result.cloudLibTotalDevices} 款星闪方案外设 PCB`;
              result.hasLibUpdate = !!(result.cloudLibVersion && result.cloudLibVersion > currentLib);
            } else {
              result.rawManifest = json;
              result.rawDbData = null;
              if (json.libVersion) {
                result.cloudLibVersion = json.libVersion;
                result.cloudLibTotalDevices = json.totalDevices || json.profiles?.length || 0;
                result.libDownloadUrl = json.libDownloadUrl || targetDbUrl.replace(/manifest\.json.*$/, 'device_database.spkdb');
                result.libChangelog = json.libChangelog || json.changelog || `新增适配 ${result.cloudLibTotalDevices} 款星闪方案外设 PCB`;
                result.hasLibUpdate = !!(result.cloudLibVersion && result.cloudLibVersion > currentLib);
              }
            }
          } else {
            result.libError = `HTTP ${resp.status}`;
          }
        } else if (targetDbUrl.endsWith('.spkdb') || targetDbUrl.endsWith('.zip')) {
          result.libDownloadUrl = targetDbUrl;
          const match = targetDbUrl.match(/V?(\d{4}\.\d{2}\.\d{1,2}(?:\.\d+)?)/i);
          result.cloudLibVersion = match ? match[1] : '最新版';
          result.hasLibUpdate = match ? match[1] > currentLib : true;
        }
      } catch (e) {
        result.libError = e.message;
      }
    }

    // ----------------------------------------------------
    // 2. 独立检查【驱动软件客户端更新】(专属于 software/ 目录或 Gitee 发行版)
    // ----------------------------------------------------
    const channel = this.getUpdateChannel();
    const targetAppUrl = appUrl || (channel === 'beta' ? DEFAULT_BETA_APP_URL : DEFAULT_APP_URL);
    let appCheckedSuccess = false;
    result.channel = channel;

    if (targetAppUrl && !targetAppUrl.includes('your_account')) {
      try {
        if (targetAppUrl.endsWith('.json')) {
          const resp = await fetch(`${targetAppUrl}?_t=${Date.now()}`, { cache: 'no-store' });
          if (resp.ok) {
            const json = await resp.json();
            result.rawManifest = json;
            if (json.appVersion) {
              result.cloudAppVersion = json.appVersion;
              result.appChangelog = json.appChangelog || '';
              result.appFileSize = json.appFileSize || '';
              result.appForceUpdate = !!json.appForceUpdate;

              // 提取云端与本地时间码
              const cloudBuildTime = json.buildTimeCode || formatTimeCode(json.buildDate) || formatTimeCode(json.appVersion) || formatTimeCode(json.updatedAt) || (channel === 'beta' ? '26.10.23' : '26.10.22');
              result.cloudAppBuildTimeCode = cloudBuildTime;
              result.currentAppBuildTimeCode = currentBuildTime;

              // 智能计算/解析下载直链：优先用清单内提供的直链，若无或为通用链接，自动拼装 Gitee 发行版 exe 格式
              let download = json.appDownloadUrl || '';
              if (!download || (!download.toLowerCase().includes('.exe') && download.includes('/releases'))) {
                // 默认拼接 Gitee 发行版直链与 GitHub 直链
                const tagPrefix = json.appVersion.startsWith('v') || json.appVersion.startsWith('beta') ? '' : 'v';
                download = `https://gitee.com/Kutaze/astra-flux-hub/releases/download/${tagPrefix}${json.appVersion}/AstraFlux-HUB_Setup_${tagPrefix}${json.appVersion}.exe`;
              }
              result.appDownloadUrl = download;

              // 执行多维度时间码与防回退判定
              const comp = compareAppVersions(result.cloudAppVersion, currentApp, channel, json, currentBuildTime);
              result.hasAppUpdate = comp.hasUpdate;
              result.isBetaBlockedByNewerOfficial = !!comp.isBlockedByNewerOfficial;
              result.betaBlockReason = comp.blockReason || null;
              result.cannotDowngradeFromBeta = !!comp.cannotDowngradeFromBeta;
              appCheckedSuccess = true;
            }
          }
        } else if (targetAppUrl.endsWith('.exe')) {
          result.appDownloadUrl = targetAppUrl;
          const match = targetAppUrl.match(/(?:v|beta0\.)?(\d+\.\d+\.\d+)/i);
          result.cloudAppVersion = match ? match[0] : '最新版';
          const cloudBuildTime = formatTimeCode(result.cloudAppVersion) || (channel === 'beta' ? '26.10.23' : '26.10.22');
          result.cloudAppBuildTimeCode = cloudBuildTime;
          result.currentAppBuildTimeCode = currentBuildTime;
          const comp = compareAppVersions(result.cloudAppVersion, currentApp, channel, null, currentBuildTime);
          result.hasAppUpdate = comp.hasUpdate;
          result.isBetaBlockedByNewerOfficial = !!comp.isBlockedByNewerOfficial;
          result.betaBlockReason = comp.blockReason || null;
          result.cannotDowngradeFromBeta = !!comp.cannotDowngradeFromBeta;
          appCheckedSuccess = true;
        }
      } catch (e) {
        result.appError = e.message;
      }
    }

    // ----------------------------------------------------
    // 3. 兜底回退：如果正式版 software/ 清单未抓到，尝试直接读取 Gitee Releases 发行版
    // ----------------------------------------------------
    if (!appCheckedSuccess && channel === 'release') {
      try {
        const giteeReleasesApi = 'https://gitee.com/api/v5/repos/kutaze/astra-flux-hub/releases/latest';
        const gResp = await fetch(`${giteeReleasesApi}?_t=${Date.now()}`, { cache: 'no-store' });
        if (gResp.ok) {
          const relJson = await gResp.json();
          const tagVer = (relJson.tag_name || '').replace(/^[vV]/, '');
          if (tagVer) {
            result.cloudAppVersion = tagVer;
            result.appChangelog = relJson.body || '';
            const exeAsset = relJson.assets?.find(a => a.name?.endsWith('.exe'));
            result.appDownloadUrl = exeAsset?.browser_download_url || 
              `https://gitee.com/Kutaze/astra-flux-hub/releases/download/v${tagVer}/AstraFlux-HUB_Setup_v${tagVer}.exe`;
            const cloudBuildTime = formatTimeCode(relJson.published_at || relJson.created_at) || '26.10.22';
            result.cloudAppBuildTimeCode = cloudBuildTime;
            result.currentAppBuildTimeCode = currentBuildTime;
            const comp = compareAppVersions(result.cloudAppVersion, currentApp, channel, { updatedAt: relJson.published_at }, currentBuildTime);
            result.hasAppUpdate = comp.hasUpdate;
            result.isBetaBlockedByNewerOfficial = !!comp.isBlockedByNewerOfficial;
            result.betaBlockReason = comp.blockReason || null;
            result.cannotDowngradeFromBeta = !!comp.cannotDowngradeFromBeta;
            result.appError = null;
          }
        }
      } catch (err2) {}
    }

    // 默认保底下载链接
    if (!result.appDownloadUrl) {
      result.appDownloadUrl = GITHUB_RELEASES_PAGE;
    }

    return result;
  }

  // 2. 检查云端更新（兼顾 SettingsTab 既有调用）
  async checkForUpdates() {
    const res = await this.checkBothVersions();
    return {
      configured: true,
      hasLibUpdate: res.hasLibUpdate,
      hasAppUpdate: res.hasAppUpdate,
      manifest: {
        libVersion: res.cloudLibVersion,
        libDownloadUrl: res.libDownloadUrl,
        totalDevices: res.cloudLibTotalDevices,
        appVersion: res.cloudAppVersion,
        appDownloadUrl: res.appDownloadUrl,
        appChangelog: res.appChangelog,
      },
      currentAppVersion: res.currentAppVersion,
      currentLibVersion: res.currentLibVersion,
      error: res.libError && res.appError ? `${res.libError}; ${res.appError}` : (res.libError || res.appError),
    };
  }

  // 3. 执行【键盘数据库在线热更新】(自动下载云端 .spkdb 集合包并解包覆写本地，无需重装驱动)
  async performOnlineDbUpdate(customDbUrl = null, prefetchedDb = null) {
    let dbObj = prefetchedDb;

    if (!dbObj) {
      let targetUrl = (customDbUrl || this.getDbUpdateUrl()).trim();
      if (!targetUrl || targetUrl.includes('your_account')) {
        targetUrl = DEFAULT_DB_URL;
      }

      // 如果 targetUrl 是 manifest.json 清单，先拉取清单获取真实的 libDownloadUrl
      let finalLibUrl = targetUrl;
      let manifestData = null;
      if (targetUrl.endsWith('.json') || targetUrl.includes('manifest')) {
        const mResp = await fetch(`${targetUrl}?_t=${Date.now()}`, { cache: 'no-store' });
        if (!mResp.ok) throw new Error(`拉取更新清单失败: HTTP ${mResp.status}`);
        const mJson = await mResp.json();
        manifestData = mJson;
        if (mJson.libDownloadUrl) {
          finalLibUrl = mJson.libDownloadUrl;
        } else if (Array.isArray(mJson.profiles)) {
          dbObj = mJson;
        }
      }

      // 下载 finalLibUrl 对应的实体文件 (.spkdb / .json)
      if (!dbObj) {
        const resp = await fetch(`${finalLibUrl}?_t=${Date.now()}`, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`下载外设数据库文件失败: HTTP ${resp.status}`);

        const arrayBuf = await resp.arrayBuffer();
        const u8 = new Uint8Array(arrayBuf);
        const isZip = (u8.length >= 4 && u8[0] === 0x50 && u8[1] === 0x4B) || finalLibUrl.endsWith('.spkdb') || finalLibUrl.endsWith('.zip');

        if (isZip) {
          const res = await this.importOfflineBundle(arrayBuf, 'device_database.spkdb');
          return {
            success: true,
            count: res.count,
            importedCount: res.importedCount,
            libVersion: res.libVersion || manifestData?.libVersion || this.getCurrentLibVersion(),
          };
        } else {
          const text = new TextDecoder('utf-8').decode(arrayBuf);
          dbObj = JSON.parse(text);
        }
      }
    }

    const result = customDeviceRegistry.importFullDatabase(dbObj);
    if (dbObj.libVersion) {
      this.saveSettings({ currentLibVersion: dbObj.libVersion });
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sparklink-update-status-refresh', { detail: { type: 'db', libVersion: dbObj.libVersion } }));
    }
    return {
      success: true,
      count: result.count,
      importedCount: result.importedCount,
      libVersion: dbObj.libVersion || this.getCurrentLibVersion(),
    };
  }

  // 4. 执行【驱动软件本体在线更新】(直接下载新版安装包并启动覆盖安装)
  async performOnlineAppUpdate(customAppUrl = null, onProgress = null) {
    let finalDownloadUrl = (customAppUrl || this.getAppUpdateUrl()).trim();

    if (!finalDownloadUrl || finalDownloadUrl.includes('your_account')) {
      finalDownloadUrl = DEFAULT_APP_URL;
    }

    // 如果给的是 software/manifest.json 链接，先拉取清单读取真实的 appDownloadUrl
    if (finalDownloadUrl.endsWith('.json')) {
      try {
        const resp = await fetch(`${finalDownloadUrl}?_t=${Date.now()}`, { cache: 'no-store' });
        if (resp.ok) {
          const json = await resp.json();
          if (json.appDownloadUrl) {
            finalDownloadUrl = json.appDownloadUrl;
          } else if (json.appVersion) {
            finalDownloadUrl = `https://gitee.com/Kutaze/astra-flux-hub/releases/download/v${json.appVersion}/AstraFlux-HUB_Setup_v${json.appVersion}.exe`;
          }
        }
      } catch (e) {}
    }

    // 如果链接是指向发行版页面且未直接以 .exe 结尾，自动解析
    if (!finalDownloadUrl.toLowerCase().includes('.exe') && (finalDownloadUrl.includes('/releases') || finalDownloadUrl === GITEE_RELEASES_PAGE)) {
      finalDownloadUrl = `https://gitee.com/Kutaze/astra-flux-hub/releases/download/v${CURRENT_APP_VERSION}/AstraFlux-HUB_Setup_v${CURRENT_APP_VERSION}.exe`;
    }

    if (window.electronAPI?.downloadAndInstallApp && finalDownloadUrl.endsWith('.exe')) {
      if (onProgress && window.electronAPI.onDownloadProgress) {
        window.electronAPI.onDownloadProgress(onProgress);
      }
      return await window.electronAPI.downloadAndInstallApp(finalDownloadUrl);
    } else {
      if (window.electronAPI?.openExternalUrl) {
        await window.electronAPI.openExternalUrl(finalDownloadUrl);
      } else {
        window.open(finalDownloadUrl, '_blank');
      }
      return { browserOpened: true, downloadUrl: finalDownloadUrl };
    }
  }

  // 5. 核心：导入单文件离线集合包 (.spkdb / .zip) 或单机探针/数据库 JSON
  async importOfflineBundle(fileOrBuffer, fileName = '') {
    const isZipLike =
      fileName.endsWith('.spkdb') ||
      fileName.endsWith('.zip') ||
      fileOrBuffer instanceof ArrayBuffer ||
      fileOrBuffer instanceof Uint8Array;

    if (isZipLike) {
      try {
        const zip = await JSZip.loadAsync(fileOrBuffer);
        let fullDb = null;
        let manifest = null;
        const filesMap = {};

        if (zip.file('manifest.json')) {
          try {
            manifest = JSON.parse(await zip.file('manifest.json').async('string'));
          } catch (e) {}
        }

        if (zip.file('device_db.json')) {
          const content = await zip.file('device_db.json').async('string');
          fullDb = JSON.parse(content);
        } else {
          const profiles = [];
          const files = Object.keys(zip.files);
          for (const f of files) {
            if (f.endsWith('.json') && !f.includes('manifest.json')) {
              try {
                const content = await zip.files[f].async('string');
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed.profiles)) {
                  fullDb = parsed;
                  break;
                } else if (parsed.hardwareFingerprint || parsed.matrixLayout || parsed.meta) {
                  profiles.push(parsed);
                }
              } catch (e) {}
            }
          }
          if (!fullDb && profiles.length > 0) {
            fullDb = {
              libVersion: manifest?.libVersion || '2026.10.20.1',
              totalDevices: profiles.length,
              profiles,
            };
          }
        }

        if (!fullDb) {
          throw new Error('未能在集合包中找到合法的设备数据库档案 (device_db.json 或 device_database/*.json)');
        }

        const zipFileKeys = Object.keys(zip.files);
        for (const k of zipFileKeys) {
          if (k.startsWith('device_database/') && k.endsWith('.json')) {
            try {
              filesMap[k.replace('device_database/', '')] = await zip.files[k].async('string');
            } catch (e) {}
          }
        }

        const importRes = customDeviceRegistry.importFullDatabase(fullDb);
        const effectiveVer = fullDb.libVersion || manifest?.libVersion || this.getCurrentLibVersion();
        this.saveSettings({ currentLibVersion: effectiveVer });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sparklink-update-status-refresh', { detail: { type: 'db', libVersion: effectiveVer } }));
        }

        if (typeof window !== 'undefined' && window.electronAPI?.saveDeviceDatabaseBundle) {
          try {
            let bufferArray = null;
            if (fileOrBuffer instanceof ArrayBuffer) {
              bufferArray = Array.from(new Uint8Array(fileOrBuffer));
            } else if (fileOrBuffer instanceof Uint8Array) {
              bufferArray = Array.from(fileOrBuffer);
            }
            window.electronAPI.saveDeviceDatabaseBundle({
              fullDb,
              filesMap,
              zipBuffer: bufferArray,
            });
          } catch (e) {
            console.warn('[Updater] 保存物理集合包文件失败:', e);
          }
        }

        return {
          success: true,
          isBundle: true,
          count: importRes.count,
          importedCount: importRes.importedCount,
          libVersion: effectiveVer,
          manifest,
        };
      } catch (err) {
        if (typeof fileOrBuffer === 'string') {
          return this.importOfflineLibFile(fileOrBuffer);
        }
        throw new Error(`集合包解包失败: ${err.message}`);
      }
    }

    return this.importOfflineLibFile(fileOrBuffer);
  }

  // 6. 导入离线库文件
  importOfflineLibFile(fileContent) {
    const rawObj = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
    const result = customDeviceRegistry.importFullDatabase(rawObj);

    if (rawObj.libVersion) {
      this.saveSettings({ currentLibVersion: rawObj.libVersion });
    }
    return {
      ...result,
      isSingleProbe: !!result.isSingleProbe,
      profile: result.device || null,
      deviceName: result.device?.name || result.device?.model || null,
      vHex: result.device?.vendorIdHex || null,
      pHex: result.device?.productIdHex || null,
      totalKeys: result.device?.totalKeyCount || 64,
      totalLeds: result.device?.lighting?.totalLeds || 64,
      libVersion: this.getCurrentLibVersion(),
    };
  }

  async applyLibUpdate(manifest) {
    return await this.performOnlineDbUpdate(manifest.libDownloadUrl);
  }

  async installAppUpdate(manifest, onProgress) {
    return await this.performOnlineAppUpdate(manifest.appDownloadUrl, onProgress);
  }
}

export const updaterService = new UpdaterService();
