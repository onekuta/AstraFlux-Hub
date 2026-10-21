/**
 * 星闪驱动云端更新与离线库升级服务 (只读客户端模式)
 * 安全原则：
 * 客户端严禁存储任何云端写操作 Token 或密钥！只执行公开的只读 HTTP GET 检查。
 * 开发者在后台设置由自己申请的云端下载直链（包括键盘数据库更新直链与驱动版本更新直链）。
 */

import { customDeviceRegistry } from './customDeviceRegistry.js';
import JSZip from 'jszip';

const UPDATER_SETTINGS_KEY = 'SPARKLINK_OTA_UPDATER_SETTINGS_V2';

// 默认预留的云端直链 (绑定 Gitee kutaze/astra-flux-hub 官方更新通道，分设 database 与 software 独立目录)
const DEFAULT_MANIFEST_URL = 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/manifest.json';
const DEFAULT_DB_URL = 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/database/manifest.json';
const DEFAULT_APP_URL = 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/software/manifest.json';
const CURRENT_APP_VERSION = '1.1.1';
const DEFAULT_LIB_VERSION = '2026.10.20.1';

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
          return {
            manifestUrl: DEFAULT_MANIFEST_URL,
            dbUpdateUrl: DEFAULT_DB_URL,
            appUpdateUrl: DEFAULT_APP_URL,
            currentLibVersion: DEFAULT_LIB_VERSION,
            currentAppVersion: CURRENT_APP_VERSION,
            ...parsed,
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
    return this.settings.dbUpdateUrl || this.settings.manifestUrl || DEFAULT_DB_URL;
  }

  setDbUpdateUrl(url) {
    this.saveSettings({ dbUpdateUrl: url ? url.trim() : '' });
  }

  getAppUpdateUrl() {
    return this.settings.appUpdateUrl || this.settings.manifestUrl || DEFAULT_APP_URL;
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

  // 1. 综合比对检测：支持对【数据库更新链接】与【驱动更新链接】分别进行独立或统一版本比对
  async checkBothVersions(options = {}) {
    const dbUrl = (options.dbUrl || this.getDbUpdateUrl() || '').trim();
    const appUrl = (options.appUrl || this.getAppUpdateUrl() || '').trim();
    const manifestUrl = (this.getManifestUrl() || '').trim();

    const currentLib = this.getCurrentLibVersion();
    const currentApp = this.getCurrentAppVersion();

    const result = {
      configured: false,
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
      appError: null,

      rawDbData: null,
      rawManifest: null,
    };

    // 优先通过主清单 manifest.json 获取全部更新信息 (库更新与软件更新统一清单)
    const targetManifestUrl = manifestUrl || (dbUrl?.endsWith('.json') ? dbUrl : (appUrl?.endsWith('.json') ? appUrl : DEFAULT_MANIFEST_URL));
    
    if (targetManifestUrl && !targetManifestUrl.includes('your_account')) {
      try {
        const resp = await fetch(`${targetManifestUrl}?_t=${Date.now()}`, { cache: 'no-store' });
        if (resp.ok) {
          const json = await resp.json();
          result.rawManifest = json;
          result.configured = true;

          // 1. 适配库更新信息
          if (json.libVersion) {
            result.cloudLibVersion = json.libVersion;
            result.cloudLibTotalDevices = json.totalDevices || 0;
            result.libDownloadUrl = json.libDownloadUrl || (targetManifestUrl.includes('/database/') ? targetManifestUrl.replace(/manifest\.json.*$/, 'device_database.spkdb') : targetManifestUrl.replace(/manifest\.json.*$/, 'database/device_database.spkdb'));
            result.libChangelog = json.libChangelog || '';
            result.hasLibUpdate = !!(result.cloudLibVersion && result.cloudLibVersion > currentLib);
          }

          // 2. 软件版本更新信息
          if (json.appVersion) {
            result.cloudAppVersion = json.appVersion;
            result.appDownloadUrl = json.appDownloadUrl || null;
            result.appChangelog = json.appChangelog || '';
            result.hasAppUpdate = !!(result.cloudAppVersion && result.cloudAppVersion > currentApp);
          }
        }
      } catch (e) {
        result.libError = e.message;
        result.appError = e.message;
      }
    }

    // 若独立配置了 dbUrl 且此前未获取到库版本
    if (!result.cloudLibVersion && dbUrl && dbUrl !== targetManifestUrl && !dbUrl.includes('your_account')) {
      try {
        if (dbUrl.endsWith('.json')) {
          const resp = await fetch(`${dbUrl}?_t=${Date.now()}`, { cache: 'no-store' });
          if (resp.ok) {
            const json = await resp.json();
            if (json.libVersion) {
              result.cloudLibVersion = json.libVersion;
              result.cloudLibTotalDevices = json.totalDevices || json.profiles?.length || 0;
              result.libDownloadUrl = json.libDownloadUrl || dbUrl;
              result.hasLibUpdate = !!(result.cloudLibVersion && result.cloudLibVersion > currentLib);
            }
          }
        } else if (dbUrl.endsWith('.spkdb') || dbUrl.endsWith('.zip')) {
          // 直接是 spkdb 直链
          result.libDownloadUrl = dbUrl;
          const match = dbUrl.match(/V?(\d{4}\.\d{2}\.\d{1,2}(?:\.\d+)?)/i);
          result.cloudLibVersion = match ? match[1] : '最新版';
          result.hasLibUpdate = match ? match[1] > currentLib : true;
        }
      } catch (e) {
        result.libError = e.message;
      }
    }

    // 若独立配置了 appUrl 且此前未获取到软件版本
    if (!result.cloudAppVersion && appUrl && appUrl !== targetManifestUrl && !appUrl.includes('your_account')) {
      try {
        if (appUrl.endsWith('.exe')) {
          result.appDownloadUrl = appUrl;
          const match = appUrl.match(/v?(\d+\.\d+\.\d+)/i);
          result.cloudAppVersion = match ? match[1] : '最新版';
          result.hasAppUpdate = match ? match[1] > currentApp : true;
        } else if (appUrl.endsWith('.json')) {
          const resp = await fetch(`${appUrl}?_t=${Date.now()}`, { cache: 'no-store' });
          if (resp.ok) {
            const json = await resp.json();
            result.cloudAppVersion = json.appVersion || null;
            result.appDownloadUrl = json.appDownloadUrl || null;
            result.appChangelog = json.appChangelog || '';
            result.hasAppUpdate = !!(result.cloudAppVersion && result.cloudAppVersion > currentApp);
          }
        }
      } catch (e) {
        result.appError = e.message;
      }
    }

    return result;
  }

  // 2. 检查云端更新（兼顾 SettingsTab 既有调用）
  async checkForUpdates() {
    const res = await this.checkBothVersions();
    const isConfigured = !res.libError?.includes('未填写') || !res.appError?.includes('未填写');

    return {
      configured: isConfigured,
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

  // 3. 执行【键盘数据库在线热更新】(支持自动下载云端 .spkdb 集合包并解包覆写本地，无需重装驱动)
  async performOnlineDbUpdate(customDbUrl = null, prefetchedDb = null) {
    let dbObj = prefetchedDb;

    if (!dbObj) {
      let targetUrl = (customDbUrl || this.getDbUpdateUrl()).trim();
      if (!targetUrl || targetUrl.includes('your_account')) {
        throw new Error('未提供有效的数据库更新链接');
      }

      // 1. 如果 targetUrl 是 manifest.json 清单，先拉取清单获取真实的 libDownloadUrl
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
          // 本身就是全量 json 数据库
          dbObj = mJson;
        }
      }

      // 2. 如果尚未解析为 dbObj，拉取 finalLibUrl 对应的实体文件 (.spkdb / .json)
      if (!dbObj) {
        const resp = await fetch(`${finalLibUrl}?_t=${Date.now()}`, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`下载外设数据库文件失败: HTTP ${resp.status}`);

        const arrayBuf = await resp.arrayBuffer();
        const u8 = new Uint8Array(arrayBuf);
        // 检测是否是 zip / spkdb (PK magic: 0x50, 0x4B)
        const isZip = (u8.length >= 4 && u8[0] === 0x50 && u8[1] === 0x4B) || finalLibUrl.endsWith('.spkdb') || finalLibUrl.endsWith('.zip');

        if (isZip) {
          // 直接调用统一的 importOfflineBundle 解析解包并覆写本地
          const res = await this.importOfflineBundle(arrayBuf, 'device_database.spkdb');
          return {
            success: true,
            count: res.count,
            importedCount: res.importedCount,
            libVersion: res.libVersion || manifestData?.libVersion || this.getCurrentLibVersion(),
          };
        } else {
          // JSON 格式兜底解析
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

  // 4. 执行【驱动软件本体在线更新】(下载新版安装包并启动覆盖安装)
  async performOnlineAppUpdate(customAppUrl = null, onProgress = null) {
    let finalDownloadUrl = (customAppUrl || this.getAppUpdateUrl()).trim();

    if (!finalDownloadUrl || finalDownloadUrl.includes('your_account')) {
      throw new Error('未提供有效的驱动更新下载链接');
    }

    // 如果给的是 manifest.json 链接，先拉取清单读取真实的 appDownloadUrl
    if (finalDownloadUrl.endsWith('.json') || !finalDownloadUrl.endsWith('.exe')) {
      try {
        const resp = await fetch(`${finalDownloadUrl}?_t=${Date.now()}`, { cache: 'no-store' });
        if (resp.ok) {
          const json = await resp.json();
          if (json.appDownloadUrl) {
            finalDownloadUrl = json.appDownloadUrl;
          }
        }
      } catch (e) {}
    }

    if (window.electronAPI?.downloadAndInstallApp) {
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

  // 5. 核心重构：导入单文件离线集合包 (.spkdb / .zip) 或单机探针/数据库 JSON
  async importOfflineBundle(fileOrBuffer, fileName = '') {
    const isZipLike =
      fileName.endsWith('.spkdb') ||
      fileName.endsWith('.zip') ||
      fileOrBuffer instanceof ArrayBuffer ||
      fileOrBuffer instanceof Uint8Array ||
      fileOrBuffer instanceof Blob;

    if (isZipLike) {
      try {
        const zip = await JSZip.loadAsync(fileOrBuffer);
        let fullDb = null;
        let manifest = null;
        const filesMap = {};

        // 优先提取 manifest.json
        const manifestFile = zip.file('manifest.json');
        if (manifestFile) {
          try {
            const manifestStr = await manifestFile.async('string');
            manifest = JSON.parse(manifestStr);
          } catch (e) {}
        }

        // 提取全量数据库 device_db.json
        const dbFile = zip.file('device_db.json');
        if (dbFile) {
          const dbStr = await dbFile.async('string');
          fullDb = JSON.parse(dbStr);
        } else {
          // 若无单一 device_db.json，从 device_database/ 文件夹汇总
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
              libVersion: manifest?.libVersion || '2026.10.15.2',
              totalDevices: profiles.length,
              profiles,
            };
          }
        }

        if (!fullDb) {
          throw new Error('未能在集合包中找到合法的设备数据库档案 (device_db.json 或 device_database/*.json)');
        }

        // 收集所有 device_database 下的独立文件供桌面端持久化
        const zipFileKeys = Object.keys(zip.files);
        for (const k of zipFileKeys) {
          if (k.startsWith('device_database/') && k.endsWith('.json')) {
            try {
              filesMap[k.replace('device_database/', '')] = await zip.files[k].async('string');
            } catch (e) {}
          }
        }

        // 导入并生效
        const importRes = customDeviceRegistry.importFullDatabase(fullDb);
        const effectiveVer = fullDb.libVersion || manifest?.libVersion || this.getCurrentLibVersion();
        this.saveSettings({ currentLibVersion: effectiveVer });

        // 桌面端通知主进程同时持久化物理文件
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

  // 6. 导入离线库包 / 探针适配包 (智能双模识别：全量 device_db.json 与 单机探针 PCB_适配文件.json)
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

  // 兼容老调用
  async applyLibUpdate(manifest) {
    return await this.performOnlineDbUpdate(manifest.libDownloadUrl);
  }

  async installAppUpdate(manifest, onProgress) {
    return await this.performOnlineAppUpdate(manifest.appDownloadUrl, onProgress);
  }
}

export const updaterService = new UpdaterService();
