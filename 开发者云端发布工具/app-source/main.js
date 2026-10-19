const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const JSZip = require('jszip');

let mainWindow = null;
let secondaryWindows = new Set();

// 定位配置文件位置 (优先使用单文件 EXE 所在真实目录)
const getConfigPath = () => {
  const portableDir = process.env.PORTABLE_EXECUTABLE_DIR || process.cwd();
  return path.join(portableDir, 'config.json');
};

const defaultSettings = {
  platform: 'gitee',
  gitee: {
    owner: '',
    repo: 'sparklink-hub-releases',
    branch: 'master',
    accessToken: '',
  },
  github: {
    owner: '',
    repo: 'sparklink-hub-releases',
    branch: 'main',
    personalToken: '',
  },
  appRelease: {
    appVersion: '1.1.0',
    appDownloadUrl: '',
    changelog: '1. 优化星闪高速回报率与低延迟稳定性\n2. 适配最新客制化键盘硬件数据库',
    forceUpdate: false,
    fileSize: '',
  },
  dbRelease: {
    libVersion: '',
    changelog: '新增适配客制化星闪方案外设 PCB，支持 8000Hz 与磁轴快速触发',
  },
};

const loadSettings = () => {
  try {
    const p = getConfigPath();
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
      return {
        ...defaultSettings,
        ...data,
        gitee: { ...defaultSettings.gitee, ...(data.gitee || {}) },
        appRelease: { ...defaultSettings.appRelease, ...(data.appRelease || {}) },
        dbRelease: { ...defaultSettings.dbRelease, ...(data.dbRelease || {}) },
      };
    }
  } catch (e) {
    console.error('读取配置失败:', e);
  }
  return { ...defaultSettings };
};

const saveSettings = (newSettings) => {
  try {
    const p = getConfigPath();
    const current = loadSettings();
    const merged = { ...current, ...newSettings };
    fs.writeFileSync(p, JSON.stringify(merged, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('保存配置失败:', e);
    return false;
  }
};

function createPublisherWindow(viewType = 'db') {
  const win = new BrowserWindow({
    width: 980,
    height: 740,
    minWidth: 880,
    minHeight: 650,
    frame: false,
    show: false,
    backgroundColor: '#0a0f1d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'), { query: { view: viewType } });

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  win.on('closed', () => {
    secondaryWindows.delete(win);
    if (win === mainWindow) mainWindow = null;
  });

  return win;
}

// 广播日志到所有打开的窗口
function broadcastLog(type, text) {
  const allWins = BrowserWindow.getAllWindows();
  const time = new Date().toLocaleTimeString();
  allWins.forEach((w) => {
    if (!w.isDestroyed()) {
      w.webContents.send('publish-log', { type, text, time });
    }
  });
}

// Gitee API 请求封装
function giteeRequest(method, apiPath, token, payload = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://gitee.com/api/v5${apiPath}`);
    if (token) url.searchParams.set('access_token', token);

    const postData = payload ? JSON.stringify(payload) : null;
    const req = https.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SparkLink-Publisher/1.0',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const data = body ? JSON.parse(body) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ statusCode: res.statusCode, data });
            } else {
              reject(new Error(`Gitee HTTP ${res.statusCode}: ${data.message || body}`));
            }
          } catch (e) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ statusCode: res.statusCode, data: body });
            } else {
              reject(new Error(`Gitee HTTP ${res.statusCode}: ${body}`));
            }
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// 辅助：获取云端或本地既有的 manifest.json
async function getExistingManifest(cfg) {
  const g = cfg.gitee;
  const portableDir = process.env.PORTABLE_EXECUTABLE_DIR || process.cwd();
  const localManifestPath = path.join(portableDir, 'dist_cloud', 'manifest.json');

  let defaultManifest = {
    libVersion: '2026.10.14.1',
    libDownloadUrl: '',
    totalDevices: 0,
    libChangelog: '初始化外设库',
    appVersion: '1.1.0',
    appDownloadUrl: '',
    appChangelog: '开源客制化外设驱动发布版',
    appForceUpdate: false,
    appFileSize: '',
    updatedAt: new Date().toISOString(),
  };

  // 1. 尝试从本地 dist_cloud 读取
  try {
    if (fs.existsSync(localManifestPath)) {
      defaultManifest = { ...defaultManifest, ...JSON.parse(fs.readFileSync(localManifestPath, 'utf-8')) };
    }
  } catch (e) {}

  // 2. 若配置了 Gitee，尝试从 Gitee 获取最新在线版本
  let remoteSha = null;
  if (cfg.platform === 'gitee' && g.owner && g.repo && g.accessToken) {
    try {
      const res = await giteeRequest('GET', `/repos/${g.owner}/${g.repo}/contents/manifest.json?ref=${g.branch || 'master'}`, g.accessToken);
      if (res.data?.content) {
        remoteSha = res.data.sha;
        const decoded = Buffer.from(res.data.content, 'base64').toString('utf-8');
        defaultManifest = { ...defaultManifest, ...JSON.parse(decoded) };
      }
    } catch (e) {}
  }

  return { manifest: defaultManifest, remoteSha };
}

// 辅助：上传单个文件到 Gitee
async function uploadGiteeFile(g, fileName, content, commitMsg) {
  const pathEncoded = encodeURIComponent(fileName);
  let sha = null;
  try {
    const getRes = await giteeRequest('GET', `/repos/${g.owner}/${g.repo}/contents/${pathEncoded}?ref=${g.branch || 'master'}`, g.accessToken);
    sha = getRes.data?.sha;
  } catch (e) {}

  const bodyPayload = {
    content: Buffer.from(content).toString('base64'),
    message: commitMsg || `Update ${fileName} via SparkLink Publisher`,
    branch: g.branch || 'master',
  };
  if (sha) bodyPayload.sha = sha;

  await giteeRequest(sha ? 'PUT' : 'POST', `/repos/${g.owner}/${g.repo}/contents/${pathEncoded}`, g.accessToken, bodyPayload);
}

// 窗口控制 IPC
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.minimize();
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.close();
});

// 打开独立第二窗口
ipcMain.on('open-secondary-window', (event, viewType) => {
  const win = createPublisherWindow(viewType);
  secondaryWindows.add(win);
});

ipcMain.handle('open-external-url', async (event, url) => {
  if (url) await shell.openExternal(url);
  return true;
});

ipcMain.handle('load-config', async () => loadSettings());
ipcMain.handle('save-config', async (event, cfg) => saveSettings(cfg));

function saveProfilesToFolders(profiles, libVersion = '2026.10.15.2') {
  const portableDir = process.env.PORTABLE_EXECUTABLE_DIR || process.cwd();
  const candidateDirs = [
    portableDir,
    path.join(portableDir, '..', '软件本体'),
    path.join(portableDir, '..', '工程源码'),
    path.join(__dirname, '..'),
  ];

  const dbData = {
    libVersion,
    exportedAt: new Date().toISOString(),
    generator: 'SparkLink PlayJoy HUB Device Database',
    totalDevices: profiles.length,
    profiles,
  };

  candidateDirs.forEach((baseDir) => {
    try {
      if (fs.existsSync(baseDir)) {
        const folder = path.join(baseDir, 'device_database');
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        
        profiles.forEach((item) => {
          const vHex = (item.hardwareFingerprint?.vendorIdHex || ('0x' + (item.vendorId || item.deviceProfile?.vendorId || 0x1ca6).toString(16))).toUpperCase();
          const pHex = (item.hardwareFingerprint?.productIdHex || ('0x' + (item.productId || item.deviceProfile?.productId || 0x1c24).toString(16))).toUpperCase();
          const brand = (item.hardwareFingerprint?.brandName || item.deviceProfile?.brand || item.brand || '客制化').replace(/[\\/:*?"<>|\s]/g, '_');
          const model = (item.deviceProfile?.model || item.model || item.shortName || '键盘').replace(/[\\/:*?"<>|\s]/g, '_');
          const fname = `${brand}_${model}_${vHex}_${pHex}.json`;
          fs.writeFileSync(path.join(folder, fname), JSON.stringify(item, null, 2), 'utf-8');
        });

        fs.writeFileSync(path.join(baseDir, 'device_db.json'), JSON.stringify(dbData, null, 2), 'utf-8');
      }
    } catch (e) {}
  });
}

ipcMain.handle('load-default-database', async () => {
  const portableDir = process.env.PORTABLE_EXECUTABLE_DIR || process.cwd();
  const searchDirs = [
    portableDir,
    path.join(portableDir, '..', '软件本体'),
    path.join(portableDir, '..', '工程源码'),
    path.join(__dirname, '..'),
    path.join(process.cwd(), '软件本体'),
  ];

  let foundProfiles = [];
  let foundVersion = '2026.10.15.2';

  // 1. 优先扫描 device_database 文件夹
  for (const dir of searchDirs) {
    const dbDir = path.join(dir, 'device_database');
    if (fs.existsSync(dbDir)) {
      try {
        const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json'));
        if (files.length > 0) {
          files.forEach(f => {
            try {
              const content = JSON.parse(fs.readFileSync(path.join(dbDir, f), 'utf-8'));
              foundProfiles.push(content);
            } catch (err) {}
          });
          if (foundProfiles.length > 0) {
            break;
          }
        }
      } catch (e) {}
    }
  }

  // 2. 若未从文件夹读到，或补齐版本号，尝试读取 device_db.json
  for (const dir of searchDirs) {
    const dbFile = path.join(dir, 'device_db.json');
    if (fs.existsSync(dbFile)) {
      try {
        const json = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
        if (json.libVersion) foundVersion = json.libVersion;
        if (foundProfiles.length === 0 && Array.isArray(json.profiles)) {
          foundProfiles = json.profiles;
        }
        break;
      } catch (e) {}
    }
  }

  // 去重 (基于 vendorId 和 productId)
  const map = new Map();
  foundProfiles.forEach(p => {
    const vId = p.vendorId || p.hardwareFingerprint?.vendorIdDec || p.deviceProfile?.vendorId;
    const pId = p.productId || p.hardwareFingerprint?.productIdDec || p.deviceProfile?.productId;
    const key = `${vId}_${pId}`;
    if (!map.has(key)) {
      map.set(key, p);
    }
  });

  const uniqueProfiles = Array.from(map.values());
  return {
    success: uniqueProfiles.length > 0,
    dbData: {
      libVersion: foundVersion,
      totalDevices: uniqueProfiles.length,
      profiles: uniqueProfiles,
    }
  };
});

// 1. 选择待发布的适配包文件 (支持 .spkdb 集合包, .zip, .json)
ipcMain.handle('select-package-file', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  const res = await dialog.showOpenDialog(win, {
    title: '选择适配数据包、数据库集合包或真机探针数据',
    filters: [
      { name: '星闪数据包 (*.spkdb;*.zip;*.json)', extensions: ['spkdb', 'zip', 'json'] },
      { name: '星闪数据库集合包 (*.spkdb)', extensions: ['spkdb'] },
      { name: 'ZIP 压缩包 (*.zip)', extensions: ['zip'] },
      { name: 'JSON 数据包 (*.json)', extensions: ['json'] },
    ],
    properties: ['openFile'],
  });

  if (res.canceled || !res.filePaths.length) return { canceled: true };
  const filePath = res.filePaths[0];
  try {
    const isZip = filePath.endsWith('.spkdb') || filePath.endsWith('.zip');
    if (isZip) {
      const fileBuf = fs.readFileSync(filePath);
      const zip = await JSZip.loadAsync(fileBuf);
      let data = null;
      if (zip.file('device_db.json')) {
        const str = await zip.file('device_db.json').async('string');
        data = JSON.parse(str);
      } else {
        const profiles = [];
        const files = Object.keys(zip.files);
        for (const f of files) {
          if (f.endsWith('.json') && !f.includes('manifest.json')) {
            try {
              const text = await zip.files[f].async('string');
              const parsed = JSON.parse(text);
              if (Array.isArray(parsed.profiles)) {
                data = parsed;
                break;
              } else if (parsed.hardwareFingerprint || parsed.matrixLayout || parsed.meta) {
                profiles.push(parsed);
              }
            } catch (e) {}
          }
        }
        if (!data && profiles.length > 0) {
          data = { libVersion: '2026.10.15.2', totalDevices: profiles.length, profiles };
        }
      }
      if (!data) throw new Error('集合包中未找到有效的键盘配置文件');
      return { canceled: false, filePath, fileName: path.basename(filePath), data };
    } else {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(rawContent);
      return { canceled: false, filePath, fileName: path.basename(filePath), data };
    }
  } catch (err) {
    return { canceled: false, filePath, fileName: path.basename(filePath), error: err.message };
  }
});

// 解析拖拽上传的数据包 (Buffer 版，支持 .spkdb, .zip, .json)
ipcMain.handle('parse-dropped-package-buffer', async (event, fileName, arrayBuf) => {
  try {
    const isZip = fileName.endsWith('.spkdb') || fileName.endsWith('.zip');
    if (isZip) {
      const zip = await JSZip.loadAsync(Buffer.from(arrayBuf));
      let data = null;
      if (zip.file('device_db.json')) {
        const str = await zip.file('device_db.json').async('string');
        data = JSON.parse(str);
      } else {
        const profiles = [];
        const files = Object.keys(zip.files);
        for (const f of files) {
          if (f.endsWith('.json') && !f.includes('manifest.json')) {
            try {
              const text = await zip.files[f].async('string');
              const parsed = JSON.parse(text);
              if (Array.isArray(parsed.profiles)) {
                data = parsed;
                break;
              } else if (parsed.hardwareFingerprint || parsed.matrixLayout || parsed.meta) {
                profiles.push(parsed);
              }
            } catch (e) {}
          }
        }
        if (!data && profiles.length > 0) {
          data = { libVersion: '2026.10.15.2', totalDevices: profiles.length, profiles };
        }
      }
      if (!data) throw new Error('集合包中未找到有效的键盘配置文件');
      return { success: true, fileName, data };
    } else {
      const text = Buffer.from(arrayBuf).toString('utf-8');
      const data = JSON.parse(text);
      return { success: true, fileName, data };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 2. 选择驱动安装包文件
ipcMain.handle('select-installer-file', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  const res = await dialog.showOpenDialog(win, {
    title: '选择新版驱动安装包',
    filters: [{ name: '可执行安装程序 (*.exe)', extensions: ['exe'] }],
    properties: ['openFile'],
  });

  if (res.canceled || !res.filePaths.length) return { canceled: true };
  const filePath = res.filePaths[0];
  const stat = fs.statSync(filePath);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
  return {
    canceled: false,
    filePath,
    fileName: path.basename(filePath),
    sizeBytes: stat.size,
    sizeFormatted: `${sizeMb} MB`,
  };
});

// 3. 测试直链有效性
ipcMain.handle('test-url-reachability', async (event, testUrl) => {
  return new Promise((resolve) => {
    try {
      const u = new URL(testUrl);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.request(u, { method: 'HEAD', timeout: 7000 }, (res) => {
        const len = res.headers['content-length'];
        const sizeMb = len ? `${(parseInt(len, 10) / (1024 * 1024)).toFixed(1)} MB` : '未知大小';
        resolve({
          reachable: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'] || '未知类型',
          sizeFormatted: sizeMb,
        });
      });
      req.on('error', (err) => resolve({ reachable: false, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ reachable: false, error: '请求超时 (超过7秒)' }); });
      req.end();
    } catch (e) {
      resolve({ reachable: false, error: e.message });
    }
  });
});

// 4. 测试 Gitee 仓库连接
ipcMain.handle('test-cloud-connection', async (event, cfg) => {
  const g = cfg.gitee;
  if (!g.owner || !g.repo || !g.accessToken) {
    return { success: false, error: '请先填写完整的 Gitee 空间名、仓库名与私人令牌！' };
  }

  try {
    const res = await giteeRequest('GET', `/repos/${g.owner}/${g.repo}`, g.accessToken);
    return {
      success: true,
      repoName: res.data.human_name || res.data.name,
      isPrivate: res.data.private,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// =========================================================================
// 5. 【窗口一】：仅推送键盘数据库更新 (Device DB Hot-Update)
// =========================================================================
ipcMain.handle('publish-lib-update', async (event, payload) => {
  const { platform, config: cfg, dbData, libVersion, changelog } = payload;
  const now = new Date();

  broadcastLog('info', `================================================`);
  broadcastLog('info', `[键盘数据库推送] 开始构建外设适配库 (版本: ${libVersion}, 包含硬件: ${dbData.profiles?.length || 0} 款)...`);

  const cleanDbData = {
    libVersion,
    exportedAt: now.toISOString(),
    generator: 'SparkLink PlayJoy HUB Cloud Publisher',
    totalDevices: dbData.profiles?.length || 0,
    profiles: dbData.profiles || [],
  };

  const g = cfg.gitee;
  const rawBase = `https://gitee.com/${g.owner}/${g.repo}/raw/${g.branch || 'master'}`;
  const manifestUrl = `${rawBase}/manifest.json`;
  const libDownloadUrl = `${rawBase}/device_db.json`;

  // 获取既有清单，保留原有的软件版本信息 (appVersion 等)
  const { manifest: currentManifest } = await getExistingManifest(cfg);

  const updatedManifest = {
    ...currentManifest,
    libVersion,
    libDownloadUrl,
    totalDevices: cleanDbData.totalDevices,
    libChangelog: changelog || `优化星闪连接稳定性并新增 ${cleanDbData.totalDevices} 款外设硬件适配`,
    updatedAt: now.toISOString(),
  };

  // 1. 本地 dist_cloud 备份
  const portableDir = process.env.PORTABLE_EXECUTABLE_DIR || process.cwd();
  const distDir = path.join(portableDir, 'dist_cloud');
  try {
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, 'device_db.json'), JSON.stringify(cleanDbData, null, 2), 'utf-8');
    fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(updatedManifest, null, 2), 'utf-8');
    broadcastLog('success', `[1/3] 本地清单与设备库备份完成 (已写入 dist_cloud/)`);
  } catch (err) {
    broadcastLog('warning', `本地备份写入略过: ${err.message}`);
  }

  saveProfilesToFolders(cleanDbData.profiles, libVersion);

  // 2. 推送至 Gitee
  if (platform === 'gitee') {
    broadcastLog('info', `[2/3] 正在上传 device_db.json 到 Gitee 仓库: ${g.owner}/${g.repo}...`);
    try {
      await uploadGiteeFile(g, 'device_db.json', JSON.stringify(cleanDbData, null, 2), `Update device_db.json (${libVersion})`);
      broadcastLog('success', `✓ device_db.json 上传成功！`);

      broadcastLog('info', `[3/3] 正在更新 manifest.json 清单...`);
      await uploadGiteeFile(g, 'manifest.json', JSON.stringify(updatedManifest, null, 2), `Update libVersion in manifest.json (${libVersion})`);
      broadcastLog('success', `✓ manifest.json 更新成功！`);

      broadcastLog('success', `🎉 键盘适配库已成功推送到云端！全国用户已可秒级无感热更新！`);

      saveSettings(cfg);
      return { success: true, manifestUrl, libDownloadUrl, libVersion, totalDevices: cleanDbData.totalDevices };
    } catch (err) {
      broadcastLog('error', `上传云端失败: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // 离线模式
  broadcastLog('success', `[2/2] 离线设备库已生成至本地 dist_cloud/ 目录，可直接发给用户或上传网盘！`);
  return { success: true, isLocalOnly: true, manifestUrl, libDownloadUrl, libVersion, totalDevices: cleanDbData.totalDevices };
});

// =========================================================================
// 6. 【窗口二】：仅推送驱动软件版本更新 (App Client Release OTA)
// =========================================================================
ipcMain.handle('publish-app-update', async (event, payload) => {
  const { platform, config: cfg, appVersion, appDownloadUrl, changelog, forceUpdate, fileSize } = payload;
  const now = new Date();

  broadcastLog('info', `================================================`);
  broadcastLog('info', `[驱动软件版本推送] 准备发布驱动本体新版本 (版本: V${appVersion})...`);

  const g = cfg.gitee;
  const rawBase = `https://gitee.com/${g.owner}/${g.repo}/raw/${g.branch || 'master'}`;
  const manifestUrl = `${rawBase}/manifest.json`;

  // 获取既有清单，严格保留原有的键盘适配库版本信息 (libVersion, totalDevices, libChangelog)
  const { manifest: currentManifest } = await getExistingManifest(cfg);

  const updatedManifest = {
    ...currentManifest,
    appVersion,
    appDownloadUrl,
    appChangelog: changelog || '常规性能优化与稳定性增强',
    appForceUpdate: !!forceUpdate,
    appFileSize: fileSize || currentManifest.appFileSize || '',
    updatedAt: now.toISOString(),
  };

  // 1. 本地备份
  const portableDir = process.env.PORTABLE_EXECUTABLE_DIR || process.cwd();
  const distDir = path.join(portableDir, 'dist_cloud');
  try {
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(updatedManifest, null, 2), 'utf-8');
    broadcastLog('success', `[1/2] 最新软件更新清单备份完成 (已写入 dist_cloud/manifest.json)`);
  } catch (err) {
    broadcastLog('warning', `本地备份写入略过: ${err.message}`);
  }

  // 2. 推送至 Gitee
  if (platform === 'gitee') {
    broadcastLog('info', `[2/2] 正在向 Gitee 仓库提交最新版本清单 manifest.json ...`);
    try {
      await uploadGiteeFile(g, 'manifest.json', JSON.stringify(updatedManifest, null, 2), `Release App Version V${appVersion}`);
      broadcastLog('success', `✓ manifest.json 更新成功！新版本 V${appVersion} 已生效！`);
      broadcastLog('success', `🎉 驱动软件新版本已成功推送！全国用户的客户端将自动检测并弹出覆盖安装提示！`);

      saveSettings(cfg);
      return { success: true, manifestUrl, appVersion, appDownloadUrl };
    } catch (err) {
      broadcastLog('error', `推送软件版本失败: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // 离线模式
  broadcastLog('success', `[2/2] 离线更新清单已生成至本地 dist_cloud/manifest.json！`);
  return { success: true, isLocalOnly: true, manifestUrl, appVersion, appDownloadUrl };
});

// 本地导出目录选择
ipcMain.handle('export-local-package', async (event, payload) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  const res = await dialog.showOpenDialog(win, {
    title: '选择导出保存目录',
    properties: ['openDirectory', 'createDirectory'],
  });

  if (res.canceled || !res.filePaths.length) return { canceled: true };
  const targetDir = res.filePaths[0];

  const { dbData, libVersion, changelog, appDownloadUrl, appVersion, config: cfg } = payload;
  const now = new Date();

  const cleanDbData = {
    libVersion: libVersion || '2026.10.14.1',
    exportedAt: now.toISOString(),
    generator: 'SparkLink PlayJoy HUB Cloud Publisher',
    totalDevices: dbData?.profiles?.length || 0,
    profiles: dbData?.profiles || [],
  };

  const manifest = {
    libVersion: cleanDbData.libVersion,
    libDownloadUrl: 'https://your-domain-or-cloud-drive.com/device_db.json',
    totalDevices: cleanDbData.totalDevices,
    libChangelog: changelog || `优化星闪连接稳定性并新增 ${cleanDbData.totalDevices} 款外设硬件适配`,
    appVersion: appVersion || cfg.appRelease?.appVersion || '1.4.0',
    appDownloadUrl: appDownloadUrl || '',
    appChangelog: cfg.appRelease?.changelog || '优化星闪连接稳定性与新客制化 PCB 即时适配',
    updatedAt: now.toISOString(),
  };

  fs.writeFileSync(path.join(targetDir, 'device_db.json'), JSON.stringify(cleanDbData, null, 2), 'utf-8');
  fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  // 同时也导出独立每把键盘的 device_database 文件夹
  const dbFolder = path.join(targetDir, 'device_database');
  if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });
  (cleanDbData.profiles || []).forEach((item) => {
    const vHex = (item.hardwareFingerprint?.vendorIdHex || ('0x' + (item.vendorId || item.deviceProfile?.vendorId || 0x1ca6).toString(16))).toUpperCase();
    const pHex = (item.hardwareFingerprint?.productIdHex || ('0x' + (item.productId || item.deviceProfile?.productId || 0x1c24).toString(16))).toUpperCase();
    const brand = (item.hardwareFingerprint?.brandName || item.deviceProfile?.brand || item.brand || '客制化').replace(/[\\/:*?"<>|\s]/g, '_');
    const model = (item.deviceProfile?.model || item.model || item.shortName || '键盘').replace(/[\\/:*?"<>|\s]/g, '_');
    const fname = `${brand}_${model}_${vHex}_${pHex}.json`;
    fs.writeFileSync(path.join(dbFolder, fname), JSON.stringify(item, null, 2), 'utf-8');
  });

  return { canceled: false, targetDir, folderPath: dbFolder };
});

// 核心重构：一键导出单文件数据库集合包 (*.spkdb / *.zip)
ipcMain.handle('export-spkdb-bundle', async (event, payload) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  const { dbData, libVersion, changelog } = payload;
  const now = new Date();
  const ver = libVersion || '2026.10.15.2';
  const totalCount = dbData?.profiles?.length || 0;

  const cleanDbData = {
    libVersion: ver,
    exportedAt: now.toISOString(),
    generator: 'SparkLink PlayJoy HUB Complete Device Registry',
    totalDevices: totalCount,
    profiles: dbData?.profiles || [],
  };

  const manifest = {
    bundleType: 'sparklink-device-database-bundle',
    formatVersion: '1.4.1',
    libVersion: ver,
    totalDevices: totalCount,
    exportedAt: now.toISOString(),
    generator: 'SparkLink PlayJoy Cloud Publisher (星闪外设全量数据库集合包)',
    description: '星闪全量键盘高保真数据库集合包 (包含物理矩阵、灯珠拓扑、5灯空格与双灯、出厂校准等全部规范配置)',
    changelog: changelog || `优化星闪连接稳定性并收录 ${totalCount} 款外设硬件规范档案`,
  };

  const zip = new JSZip();
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('device_db.json', JSON.stringify(cleanDbData, null, 2));

  const dbFolder = zip.folder('device_database');
  (cleanDbData.profiles || []).forEach((item) => {
    const vHex = (item.hardwareFingerprint?.vendorIdHex || ('0x' + (item.vendorId || item.deviceProfile?.vendorId || 0x1ca6).toString(16))).toUpperCase();
    const pHex = (item.hardwareFingerprint?.productIdHex || ('0x' + (item.productId || item.deviceProfile?.productId || 0x1c24).toString(16))).toUpperCase();
    const brand = (item.hardwareFingerprint?.brandName || item.deviceProfile?.brand || item.brand || '客制化').replace(/[\\/:*?"<>|\s]/g, '_');
    const model = (item.deviceProfile?.model || item.model || item.shortName || '键盘').replace(/[\\/:*?"<>|\s]/g, '_');
    const fname = `${brand}_${model}_${vHex}_${pHex}.json`;
    dbFolder.file(fname, JSON.stringify(item, null, 2));
  });

  const readme = `======================================================================
  🎉 星闪悦动外设全量数据库集合包 (.spkdb)
======================================================================

【基本信息】
- 适配库版本: ${ver}
- 外设硬件总数: ${totalCount} 款键盘 / PCB
- 硬件规约标准: 星闪探针规范 Probe Hardware Schema v1.4.1
- 封装格式: 星闪数据库专有包 (.spkdb / 标准 ZIP 兼容结构)

【如何在星闪驱动中导入此文件？】
1. 打开电脑上的「星闪悦动驱动」客户端；
2. 点击顶部「设置」页面（或进入底部「开发者后台」）；
3. 找到「导入离线适配库集合包」，点击并选中本文件（.spkdb 或 .zip）；
4. 驱动程序将自动完成解析并覆写至本地系统，即刻生效识别全部硬件！无需重新安装驱动。
======================================================================`;
  zip.file('使用说明.txt', readme);

  const res = await dialog.showSaveDialog(win, {
    title: '导出星闪全量外设数据库集合包',
    defaultPath: `星闪全量外设数据库_V${ver}.spkdb`,
    filters: [
      { name: '星闪外设数据库集合包 (*.spkdb)', extensions: ['spkdb'] },
      { name: 'ZIP 压缩文件 (*.zip)', extensions: ['zip'] },
    ],
  });

  if (res.canceled || !res.filePath) return { canceled: true };

  const targetFile = res.filePath;
  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  fs.writeFileSync(targetFile, buffer);
  const stat = fs.statSync(targetFile);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);

  broadcastLog('success', `================================================`);
  broadcastLog('success', `🎉 数据库集合包导出成功！目标文件: ${path.basename(targetFile)} (${sizeMb} MB)`);
  broadcastLog('info', `单文件集合包内含全部 ${totalCount} 款外设硬件规范配置，可直接发到 QQ 群或网盘供用户一键导入更新！`);

  return {
    canceled: false,
    filePath: targetFile,
    fileName: path.basename(targetFile),
    sizeFormatted: `${sizeMb} MB`,
    libVersion: ver,
    totalDevices: totalCount,
  };
});

// 导出绿色升级安装包 (.bat)
ipcMain.handle('export-green-patch', async (event, payload) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  const { dbData, libVersion } = payload;
  const now = new Date();

  const cleanDbData = {
    libVersion: libVersion || '2026.10.15.2',
    exportedAt: now.toISOString(),
    generator: 'SparkLink PlayJoy HUB Complete Device Registry',
    totalDevices: dbData?.profiles?.length || 0,
    profiles: dbData?.profiles || [],
  };

  const ver = cleanDbData.libVersion;
  const totalCount = cleanDbData.totalDevices;

  const res = await dialog.showSaveDialog(win, {
    title: '导出星闪键盘数据库一键更新升级包',
    defaultPath: `星闪键盘数据库一键更新补丁_V${ver}.bat`,
    filters: [{ name: 'Windows 批处理执行脚本 (*.bat)', extensions: ['bat'] }],
  });

  if (res.canceled || !res.filePath) return { canceled: true };

  const targetBat = res.filePath;
  const dbJsonFormatted = JSON.stringify(cleanDbData, null, 2);
  const base64Str = Buffer.from(dbJsonFormatted, 'utf-8').toString('base64');
  const outDir = path.dirname(targetBat);
  const dbFolder = path.join(outDir, 'device_database');
  if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });

  (cleanDbData.profiles || []).forEach((item) => {
    const vHex = (item.hardwareFingerprint?.vendorIdHex || ('0x' + (item.vendorId || item.deviceProfile?.vendorId || 0x1ca6).toString(16))).toUpperCase();
    const pHex = (item.hardwareFingerprint?.productIdHex || ('0x' + (item.productId || item.deviceProfile?.productId || 0x1c24).toString(16))).toUpperCase();
    const brand = (item.hardwareFingerprint?.brandName || item.deviceProfile?.brand || item.brand || '客制化').replace(/[\\/:*?"<>|\s]/g, '_');
    const model = (item.deviceProfile?.model || item.model || item.shortName || '键盘').replace(/[\\/:*?"<>|\s]/g, '_');
    const fname = `${brand}_${model}_${vHex}_${pHex}.json`;
    fs.writeFileSync(path.join(dbFolder, fname), JSON.stringify(item, null, 2), 'utf-8');
  });

  const batContent = `@echo off
chcp 65001 >nul
title 星闪悦动驱动 - 键盘适配数据库一键升级工具
cls
echo ======================================================================
echo          🎉 星闪悦动驱动 - 键盘适配数据库一键升级与覆写工具
echo ======================================================================
echo.
echo [1/3] 正在检测运行中的星闪驱动进程...
taskkill /F /IM "星闪悦动HUB.exe" >nul 2>&1
taskkill /F /IM "sparklink-hub.exe" >nul 2>&1
ping 127.0.0.1 -n 2 >nul

echo [2/3] 正在自动检索驱动本地数据库存储目录...
set "TARGET_DIR1=%APPDATA%\\sparklink-playjoy-hub"
set "TARGET_DIR2=%APPDATA%\\sparklink-hub"

if not exist "%TARGET_DIR1%" mkdir "%TARGET_DIR1%" >nul 2>&1
if not exist "%TARGET_DIR2%" mkdir "%TARGET_DIR2%" >nul 2>&1

echo [3/3] 正在安全覆写最新高版本外设数据库 (V${ver})...
if exist "%~dp0device_db.json" (
    copy /Y "%~dp0device_db.json" "%TARGET_DIR1%\\device_db.json" >nul 2>&1
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.IO.File]::WriteAllBytes(($env:APPDATA + '\\sparklink-playjoy-hub\\device_db.json'), [System.Convert]::FromBase64String('${base64Str}'))"
)

copy /Y "%TARGET_DIR1%\\device_db.json" "%TARGET_DIR2%\\device_db.json" >nul 2>&1

if exist "%~dp0device_database" (
    xcopy /E /I /Y "%~dp0device_database" "%TARGET_DIR1%\\device_database" >nul 2>&1
    xcopy /E /I /Y "%~dp0device_database" "%TARGET_DIR2%\\device_database" >nul 2>&1
)

echo.
echo ======================================================================
echo   🎉 升级完成！外设数据库已成功覆写至驱动系统目录！
echo      - 最新适配库版本: ${ver}
echo      - 包含适配硬件数: ${totalCount} 款键盘 / PCB (已同步单机硬件库)
echo      - 特性：免重新安装 100MB 驱动，重新启动驱动即可即刻识别调节！
echo ======================================================================
echo.
echo 按任意键退出...
pause >nul
`;

  fs.writeFileSync(targetBat, batContent.replace(/\r?\n/g, '\r\n'), 'utf-8');
  const jsonPath = path.join(path.dirname(targetBat), 'device_db.json');
  fs.writeFileSync(jsonPath, dbJsonFormatted, 'utf-8');

  return { canceled: false, batPath: targetBat, jsonPath, folderPath: dbFolder, libVersion: ver, totalDevices: totalCount };
});

app.whenReady().then(() => {
  mainWindow = createPublisherWindow('db');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
