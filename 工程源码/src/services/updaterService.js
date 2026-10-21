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

// 默认预留的云端直链 (完全分离 database 与 software 独立目录，禁止混在 main 根目录)
const DEFAULT_DB_URL = 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/database/manifest.json';
const DEFAULT_APP_URL = 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/software/manifest.json';
const DEFAULT_MANIFEST_URL = 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/manifest.json';
const GITEE_RELEASES_PAGE = 'https://gitee.com/Kutaze/astra-flux-hub/releases';
const GITHUB_RELEASES_PAGE = 'https://github.com/Kutaze/AstraFlux-Hub/releases';

const CURRENT_APP_VERSION = '1.1.2';
const DEFAULT_LIB_VERSION = '2026.10.20.1';

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

          return {
            manifestUrl: DEFAULT_MANIFEST_URL,
            dbUpdateUrl: cleanDbUrl,
            appUpdateUrl: cleanAppUrl,
            currentLibVersion: DEFAULT_LIB_VERSION,
            currentAppVersion: CURRENT_APP_VERSION,
            ...parsed,
            dbUpdateUrl: cleanDbUrl,
            appUpdateUrl: cleanAppUrl,
          };
        }
      }
    } catch (e) {}

    return {
      manifestUrl: DEFAULT_MANIFEST_URL,
      dbUpdateUrl: DEFAULT_DB_URL,
      appUpdateUrl: DEFAULT_APP_URL,
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

  getAppUpdateUrl() {
    const url = (this.settings.appUpdateUrl || '').trim();
    if (!url || url.includes('your_account') || url.endsWith('/raw/main/manifest.json')) {
      return DEFAULT_APP_URL;
    }
    return url;
  }

  setAppUpdateUrl(url) {
    this.saveSettings({ appUpdateUrl: url ? url.trim() : '' });
  }

  getCurrentAppVersion() {
    return CURRENT_APP_VERSION;
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
      cloudAppVersion: null,
      hasAppUpdate: false,
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
            } else {
              result.rawManifest = json;
              result.rawDbData = null;
            }
            if (json.libVersion) {
              result.cloudLibVersion = json.libVersion;
              result.cloudLibTotalDevices = json.totalDevices || json.profiles?.length || 0;
              result.libDownloadUrl = json.libDownloadUrl || targetDbUrl.replace(/manifest\.json.*$/, 'device_database.spkdb');
              result.libChangelog = json.libChangelog || `新增适配 ${result.cloudLibTotalDevices} 款星闪方案外设 PCB`;
              result.hasLibUpdate = !!(result.cloudLibVersion && result.cloudLibVersion > currentLib);
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
    const targetAppUrl = appUrl || DEFAULT_APP_URL;
    let appCheckedSuccess = false;

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

              // 智能计算/解析下载直链：优先用清单内提供的直链，若无或为通用链接，自动拼装 Gitee 发行版 exe 格式
              let download = json.appDownloadUrl || '';
              if (!download || download.includes('/releases') || !download.endsWith('.exe')) {
                // 默认拼接 Gitee 发行版直链与 GitHub 直链
                download = `https://gitee.com/Kutaze/astra-flux-hub/releases/download/v${json.appVersion}/AstraFlux-HUB_Setup_v${json.appVersion}.exe`;
              }
              result.appDownloadUrl = download;
              result.hasAppUpdate = compareSemver(result.cloudAppVersion, currentApp) > 0;
              appCheckedSuccess = true;
            }
          }
        } else if (targetAppUrl.endsWith('.exe')) {
          result.appDownloadUrl = targetAppUrl;
          const match = targetAppUrl.match(/v?(\d+\.\d+\.\d+)/i);
          result.cloudAppVersion = match ? match[1] : '最新版';
          result.hasAppUpdate = match ? compareSemver(match[1], currentApp) > 0 : true;
          appCheckedSuccess = true;
        }
      } catch (e) {
        result.appError = e.message;
      }
    }

    // ----------------------------------------------------
    // 3. 兜底回退：如果 software/ 清单未抓到，尝试直接读取 Gitee Releases 发行版
    // ----------------------------------------------------
    if (!appCheckedSuccess) {
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
            result.hasAppUpdate = compareSemver(result.cloudAppVersion, currentApp) > 0;
            result.appError = null;
          }
        }
      } catch (err2) {}
    }

    // 默认保底下载链接
    if (!result.appDownloadUrl) {
      result.appDownloadUrl = GITEE_RELEASES_PAGE;
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
    if (!finalDownloadUrl.endsWith('.exe') && (finalDownloadUrl.includes('/releases') || finalDownloadUrl === GITEE_RELEASES_PAGE)) {
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
