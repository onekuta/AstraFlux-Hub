/**
 * 星闪驱动云端更新与离线库升级服务 (只读客户端模式)
 * 安全原则：
 * 客户端严禁存储任何云端写操作 Token 或密钥！只执行公开的只读 HTTP GET 检查。
 * 开发者在后台设置由自己申请的云端下载直链（包括键盘数据库更新直链与驱动版本更新直链）。
 */

import { customDeviceRegistry } from './customDeviceRegistry.js';
import JSZip from 'jszip';

const UPDATER_SETTINGS_KEY = 'SPARKLINK_OTA_UPDATER_SETTINGS_V2';

// 默认预留的云端直链占位符 (开发者可在后台随时替换为自己申请的 Gitee Raw 或网盘直链)
const DEFAULT_MANIFEST_URL = 'https://gitee.com/your_account/sparklink-hub-releases/raw/master/manifest.json';
const DEFAULT_DB_URL = 'https://gitee.com/your_account/sparklink-hub-releases/raw/master/device_db.json';
const DEFAULT_APP_URL = 'https://gitee.com/your_account/sparklink-hub-releases/raw/master/manifest.json';
const CURRENT_APP_VERSION = '1.1.0';
const DEFAULT_LIB_VERSION = '2026.10.14.1';

class UpdaterService {
  constructor() {
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(UPDATER_SETTINGS_KEY);
        if (saved) {
          return {
            manifestUrl: DEFAULT_MANIFEST_URL,
            dbUpdateUrl: DEFAULT_DB_URL,
            appUpdateUrl: DEFAULT_APP_URL,
            currentLibVersion: DEFAULT_LIB_VERSION,
            currentAppVersion: CURRENT_APP_VERSION,
            ...JSON.parse(saved),
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

    const currentLib = this.getCurrentLibVersion();
    const currentApp = this.getCurrentAppVersion();

    const result = {
      currentLibVersion: currentLib,
      cloudLibVersion: null,
      cloudLibTotalDevices: null,
      hasLibUpdate: false,
      libDownloadUrl: null,
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

    // --- A. 检测键盘数据库版本 ---
    if (dbUrl && !dbUrl.includes('your_account')) {
      try {
        const resp = await fetch(`${dbUrl}?_t=${Date.now()}`, { cache: 'no-store' });
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const json = await resp.json();

        if (Array.isArray(json.profiles)) {
          // 直接是 device_db.json
          result.cloudLibVersion = json.libVersion || '2026.10.14';
          result.cloudLibTotalDevices = json.totalDevices || json.profiles.length;
          result.libDownloadUrl = dbUrl;
          result.rawDbData = json;
          result.hasLibUpdate = !!(result.cloudLibVersion && result.cloudLibVersion > currentLib);
        } else if (json.libVersion) {
          // 是 manifest.json
          result.cloudLibVersion = json.libVersion;
          result.cloudLibTotalDevices = json.totalDevices;
          result.libDownloadUrl = json.libDownloadUrl || dbUrl;
          result.rawManifest = json;
          result.hasLibUpdate = !!(result.cloudLibVersion && result.cloudLibVersion > currentLib);
        }
      } catch (e) {
        result.libError = e.message;
      }
    } else {
      result.libError = '未填写有效数据库更新链接';
    }

    // --- B. 检测驱动客户端版本 ---
    if (appUrl && !appUrl.includes('your_account')) {
      if (appUrl.endsWith('.exe')) {
        // 直接是安装包直链
        result.appDownloadUrl = appUrl;
        const match = appUrl.match(/v?(\d+\.\d+\.\d+)/i);
        result.cloudAppVersion = match ? match[1] : '最新版';
        result.hasAppUpdate = match ? match[1] > currentApp : true;
      } else {
        // 请求清单文件
        try {
          const resp = await fetch(`${appUrl}?_t=${Date.now()}`, { cache: 'no-store' });
          if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`);
          }
          const json = await resp.json();
          result.rawManifest = { ...result.rawManifest, ...json };
          result.cloudAppVersion = json.appVersion || null;
          result.appDownloadUrl = json.appDownloadUrl || null;
          result.appChangelog = json.appChangelog || '';
          result.hasAppUpdate = !!(result.cloudAppVersion && result.cloudAppVersion > currentApp);

          // 若此前数据库链接未填，从该清单补充库版本
          if (!result.cloudLibVersion && json.libVersion) {
            result.cloudLibVersion = json.libVersion;
            result.cloudLibTotalDevices = json.totalDevices;
            result.libDownloadUrl = json.libDownloadUrl;
            result.hasLibUpdate = !!(result.cloudLibVersion && result.cloudLibVersion > currentLib);
          }
        } catch (e) {
          result.appError = e.message;
        }
      }
    } else {
      result.appError = '未填写有效驱动更新链接';
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

  // 3. 执行【键盘数据库在线热更新】(直接下载并热覆写本地数据库，无需重装驱动)
  async performOnlineDbUpdate(customDbUrl = null, prefetchedDb = null) {
    let dbObj = prefetchedDb;

    if (!dbObj) {
      const targetUrl = (customDbUrl || this.getDbUpdateUrl()).trim();
      if (!targetUrl || targetUrl.includes('your_account')) {
        throw new Error('未提供有效的数据库更新链接');
      }

      const resp = await fetch(`${targetUrl}?_t=${Date.now()}`, { cache: 'no-store' });
      if (!resp.ok) {
        throw new Error(`下载失败: HTTP ${resp.status}`);
      }
      const data = await resp.json();

      if (Array.isArray(data.profiles)) {
        dbObj = data;
      } else if (data.libDownloadUrl) {
        // 清单内包含实际库下载地址
        const subResp = await fetch(`${data.libDownloadUrl}?_t=${Date.now()}`, { cache: 'no-store' });
        if (!subResp.ok) throw new Error(`拉取适配库失败: HTTP ${subResp.status}`);
        dbObj = await subResp.json();
      } else {
        throw new Error('返回内容不是合法的数据库或清单格式');
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
