const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// 针对 Windows 平台深度优化 Chromium 字体渲染：开启 ClearType 亚像素抗锯齿与文字锐利渲染，防止字体模糊发虚
app.commandLine.appendSwitch('enable-font-antialiasing');
app.commandLine.appendSwitch('font-render-hinting', 'medium');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('high-dpi-support', '1');

// 单实例锁：确保整台电脑只允许打开一个星闪 HUB 驱动实例
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 已有运行中的实例，直接退出当前重复进程
  app.quit();
  process.exit(0);
}

// 设置 Windows 任务栏应用专属标识符，确保任务栏图标与分组正确绑定
if (process.platform === 'win32') {
  app.setAppUserModelId('com.astraflux.hub');
}

let mainWindow = null;
let tray = null;
let isQuitting = false;

// 常规设置持久化配置文件路径 (AppData/sparklink-hub/settings.json)
const getSettingsFilePath = () => {
  const userDataDir = app.getPath('userData');
  return path.join(userDataDir, 'app-settings.json');
};

const defaultSettings = {
  autoLaunch: true,
  launchMinimizeToTray: false,
  closeAction: 'tray', // 'exit' | 'tray'
  autoUpdate: true,
};

const loadSettings = () => {
  try {
    const p = getSettingsFilePath();
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
      return { ...defaultSettings, ...data };
    }
  } catch (e) {
    console.error('[Settings] 读取配置失败:', e);
  }
  return { ...defaultSettings };
};

const saveSettings = (newSettings) => {
  try {
    const p = getSettingsFilePath();
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(newSettings, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Settings] 保存配置失败:', e);
  }
};

let appSettings = loadSettings();

// 应用开机自启 (支持最小化到托盘静默启动)
const applyAutoLaunch = (enable, minimizeToTray = false) => {
  try {
    const args = ['--autostart'];
    if (minimizeToTray) {
      args.push('--minimize-to-tray');
    }
    app.setLoginItemSettings({
      openAtLogin: !!enable,
      openAsHidden: !!minimizeToTray,
      path: process.execPath,
      args: args,
    });
    console.log(`[AutoLaunch] 设置开机自启完成: enable=${enable}, minimizeToTray=${minimizeToTray}`);
  } catch (e) {
    console.error('[AutoLaunch] 设置开机自启失败:', e);
  }
};

// 聚焦并显示主窗口 (Windows 平台可靠置顶并呼出前台)
const showMainWindow = () => {
  if (!mainWindow) {
    createWindow();
    return;
  }
  try {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true);
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(false);
  } catch (e) {
    console.error('[Window] 唤醒主窗口失败:', e);
  }
};

// 创建系统托盘与右键菜单（安全容错，绝不阻断主窗口启动）
function createTray() {
  if (tray) return;

  try {
    const icoPath = path.join(__dirname, 'icon.ico');
    const pngPath = path.join(__dirname, 'icon.png');
    let trayIcon;
    if (process.platform === 'win32' && fs.existsSync(icoPath)) {
      trayIcon = nativeImage.createFromPath(icoPath);
    } else {
      trayIcon = nativeImage.createFromPath(pngPath);
    }

    if (trayIcon.isEmpty()) {
      const fallbackPath = path.join(__dirname, '../dist/icon.png');
      if (fs.existsSync(fallbackPath)) {
        trayIcon = nativeImage.createFromPath(fallbackPath);
      }
    }
    if (!trayIcon.isEmpty() && process.platform === 'win32') {
      trayIcon = trayIcon.resize({ width: 16, height: 16, quality: 'high' });
    }

    if (trayIcon.isEmpty()) {
      console.warn('[Tray] 托盘图标资源为空，跳过创建系统托盘');
      return;
    }

    tray = new Tray(trayIcon);
    tray.setToolTip('AstraFlux-HUB (星流驱动)');

  // 动态更新托盘菜单：根据当前真实已连接的兼容外设动态呈现
  let currentTrayDevices = [];

  const updateContextMenu = (devices = currentTrayDevices) => {
    currentTrayDevices = devices || [];

    const deviceMenuItems = [];
    if (currentTrayDevices.length > 0) {
      currentTrayDevices.forEach((dev) => {
        const isOnline = dev.connected !== false;
        deviceMenuItems.push({
          label: `${isOnline ? '🟢' : '⚪'} ${dev.name || dev.displayName || '兼容外设'} (${isOnline ? '已连接' : '已授权'})`,
          click: () => {
            showMainWindow();
            mainWindow?.webContents.send('tray-show-device', dev.id || dev.model || 'active');
          },
        });
      });
    } else {
      deviceMenuItems.push({
        label: '⌨️ 未检测到兼容外设 (等待接入)',
        enabled: false,
      });
    }

    const contextMenu = Menu.buildFromTemplate([
      ...deviceMenuItems,
      { type: 'separator' },
      {
        label: '打开 AstraFlux-HUB (星流驱动)',
        click: () => showMainWindow(),
      },
      {
        label: '退出',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]);
    tray.setContextMenu(contextMenu);
  };

  // 暴露给 ipcMain 接收渲染进程传来的实时真实设备
  ipcMain.on('update-tray-devices', (event, devices) => {
    updateContextMenu(devices);
  });

  updateContextMenu();

  // 单击/双击托盘图标唤起主界面
  tray.on('click', () => {
    if (mainWindow && mainWindow.isVisible() && !mainWindow.isMinimized()) {
      mainWindow.focus();
    } else {
      showMainWindow();
    }
  });

  tray.on('double-click', () => {
    showMainWindow();
  });
  } catch (err) {
    console.error('[Tray] 创建系统托盘失败:', err);
    tray = null;
  }
}

function createWindow() {
  const icoPath = path.join(__dirname, 'icon.ico');
  const pngPath = path.join(__dirname, 'icon.png');
  const windowIcon = (process.platform === 'win32' && fs.existsSync(icoPath)) ? icoPath : pngPath;

  mainWindow = new BrowserWindow({
    width: 1380,
    height: 880,
    minWidth: 1260,
    minHeight: 800,
    frame: false, // 现代无边框自绘标题栏
    titleBarStyle: 'hidden',
    backgroundColor: '#f8fafc',
    icon: windowIcon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.platform === 'win32') {
    mainWindow.setIcon(windowIcon);
  }

  // 关键：自动授权 WebHID 供应商设备（星闪 0x1CA6 及其它键盘设备），免弹窗
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'hid') return true;
    return true;
  });

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === 'hid') return true;
    return false;
  });

  let cachedScannedHidDevices = [];

  mainWindow.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    if (details.deviceList && details.deviceList.length > 0) {
      cachedScannedHidDevices = details.deviceList;
      // 广播给渲染进程前端弹窗组件即时更新
      mainWindow.webContents.send('hid-devices-scanned', details.deviceList);

      const vendorDevice = details.deviceList.find(d =>
        d.collections && d.collections.some(c => c.usagePage === 0xffb0 || (c.usagePage >= 0xff00 && c.usagePage <= 0xffff))
      );
      if (vendorDevice) {
        callback(vendorDevice.deviceId);
        return;
      }
      const SPARKLINK_VIDS = [0x1CA6, 0x38A6, 0x1A86, 0x371C, 0x3806, 0x31E3, 7334];
      const sparklinkDevice = details.deviceList.find(d => SPARKLINK_VIDS.includes(d.vendorId));
      if (sparklinkDevice) {
        callback(sparklinkDevice.deviceId);
        return;
      }
      // 寻找具备标准键盘集合的设备
      const keyboardDevice = details.deviceList.find(d =>
        d.collections && d.collections.some(c => c.usagePage === 1 && c.usage === 6)
      );
      if (keyboardDevice) {
        callback(keyboardDevice.deviceId);
        return;
      }
      callback(details.deviceList[0].deviceId);
    } else {
      callback('');
    }
  });

  ipcMain.handle('get-scanned-hid-devices', async () => {
    return cachedScannedHidDevices;
  });

  // 拦截窗口关闭事件：根据用户“关闭面板时”常规设置决定是隐藏至托盘还是退出
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      if (appSettings.closeAction === 'tray') {
        event.preventDefault();
        mainWindow.hide();
        return false;
      }
    }
  });

  // ===================== 窗口自适应等比缩放 =====================
  // 规则：窗口放大时界面等比跟随放大，缩小时最低保持默认窗口比例 1.0 (基准尺寸 1380 x 880)
  const BASE_WIDTH = 1380;
  const BASE_HEIGHT = 880;

  function updateWindowZoom() {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    try {
      const [width, height] = mainWindow.getContentSize();
      const scale = Math.max(1.0, Math.min(width / BASE_WIDTH, height / BASE_HEIGHT));
      mainWindow.webContents.setZoomFactor(scale);
    } catch (e) {
      console.warn('[Zoom] 更新缩放比例失败:', e);
    }
  }

  mainWindow.on('resize', updateWindowZoom);
  mainWindow.on('maximize', () => {
    updateWindowZoom();
    mainWindow?.webContents.send('window-maximize-change', true);
  });
  mainWindow.on('unmaximize', () => {
    updateWindowZoom();
    mainWindow?.webContents.send('window-maximize-change', false);
  });
  mainWindow.webContents.on('did-finish-load', updateWindowZoom);

  // 窗口控制 IPC
  ipcMain.on('window-minimize', () => mainWindow?.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window-close', () => {
    if (appSettings.closeAction === 'tray') {
      mainWindow?.hide();
    } else {
      isQuitting = true;
      mainWindow?.close();
    }
  });

  // ===================== 全局常规设置 IPC =====================
  ipcMain.handle('get-app-settings', async () => {
    return appSettings;
  });

  const handleSyncAppSettings = async (event, newSettings) => {
    appSettings = { ...appSettings, ...newSettings };
    saveSettings(appSettings);
    if (appSettings.autoLaunch !== undefined) {
      applyAutoLaunch(!!appSettings.autoLaunch, !!appSettings.launchMinimizeToTray);
    }
    return { success: true, settings: appSettings };
  };

  ipcMain.handle('sync-app-settings', handleSyncAppSettings);
  ipcMain.handle('save-app-settings', handleSyncAppSettings);

  // ===================== USB 3.0 / 32K 专用驱动支持 =====================
  const findLocalDriverInstaller = () => {
    const candidates = [
      path.resolve(process.cwd(), 'EnhanceHidUSB_V140.exe'),
      path.resolve(process.cwd(), '..', 'EnhanceHidUSB_V140.exe'),
      path.resolve(app.getAppPath(), 'EnhanceHidUSB_V140.exe'),
      path.resolve(app.getAppPath(), '..', 'EnhanceHidUSB_V140.exe'),
      path.resolve(app.getAppPath(), '..', '..', 'EnhanceHidUSB_V140.exe'),
      'd:\\desk\\星闪悦动驱动\\EnhanceHidUSB_V140.exe',
      path.join(app.getPath('downloads'), 'EnhanceHidUSB_V140.exe'),
      path.join(app.getPath('desktop'), 'EnhanceHidUSB_V140.exe'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    const searchDirs = [
      process.cwd(),
      path.resolve(process.cwd(), '..'),
      app.getAppPath(),
      path.resolve(app.getAppPath(), '..'),
      'd:\\desk\\星闪悦动驱动',
    ];
    for (const dir of searchDirs) {
      try {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const found = files.find(f => f.toLowerCase().startsWith('enhancehidusb') && f.toLowerCase().endsWith('.exe'));
          if (found) return path.join(dir, found);
        }
      } catch (e) {}
    }
    return null;
  };

  const isSystemDriverInstalled = () => {
    const driverFiles = [
      'C:\\Windows\\System32\\drivers\\HIDUSB3A64.sys',
      'C:\\Windows\\System32\\drivers\\HidUSB3.sys',
      'C:\\Windows\\System32\\drivers\\HidUSB3M64.sys',
    ];
    return driverFiles.some(f => {
      try { return fs.existsSync(f); } catch (e) { return false; }
    });
  };

  ipcMain.handle('check-usb3-driver', async () => {
    const localDriverPath = findLocalDriverInstaller();
    const systemDriverInstalled = isSystemDriverInstalled();
    return {
      localDriverFound: !!localDriverPath,
      localDriverPath,
      systemDriverInstalled,
    };
  });

  ipcMain.handle('install-usb3-driver', async (event, customPath) => {
    const { shell } = require('electron');
    const { spawn } = require('child_process');
    const targetPath = customPath || findLocalDriverInstaller();
    if (!targetPath) {
      return { success: false, message: '未找到 EnhanceHidUSB 安装包，请先下载驱动' };
    }
    try {
      spawn(targetPath, [], { detached: true, stdio: 'ignore' }).unref();
      return { success: true, message: '驱动安装程序已启动，请按提示完成安装并在安装后重新插拔设备', path: targetPath };
    } catch (err) {
      const openRes = await shell.openPath(targetPath);
      if (!openRes) {
        return { success: true, message: '已调起驱动安装程序', path: targetPath };
      }
      return { success: false, message: `启动失败: ${openRes || err.message}` };
    }
  });

  ipcMain.handle('select-driver-file', async () => {
    const { dialog } = require('electron');
    const res = await dialog.showOpenDialog(mainWindow, {
      title: '选择 EnhanceHidUSB 驱动安装包',
      filters: [{ name: '可执行文件 (*.exe)', extensions: ['exe'] }],
      properties: ['openFile'],
    });
    if (res.canceled || !res.filePaths.length) {
      return { canceled: true };
    }
    const chosenPath = res.filePaths[0];
    return { canceled: false, path: chosenPath };
  });

  ipcMain.handle('open-external-url', async (event, url) => {
    const { shell } = require('electron');
    if (url) {
      await shell.openExternal(url);
      return true;
    }
    return false;
  });

  ipcMain.handle('select-json-file', async () => {
    const { dialog } = require('electron');
    const res = await dialog.showOpenDialog(mainWindow, {
      title: '选择适配数据文件或离线库包',
      filters: [{ name: 'JSON 数据包 (*.json)', extensions: ['json'] }],
      properties: ['openFile'],
    });
    if (res.canceled || !res.filePaths.length) {
      return { canceled: true };
    }
    const chosenPath = res.filePaths[0];
    try {
      const content = fs.readFileSync(chosenPath, 'utf-8');
      return { canceled: false, path: chosenPath, content };
    } catch (err) {
      return { canceled: false, path: chosenPath, error: err.message };
    }
  });

  // 设备数据库文件存储路径与自动化读写
  const getDeviceDbPath = () => {
    return path.join(app.getPath('userData'), 'device_db.json');
  };

  ipcMain.handle('save-device-database', async (event, dbData) => {
    try {
      const p = getDeviceDbPath();
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(p, JSON.stringify(dbData, null, 2), 'utf-8');

      // 同步落盘到 device_database 独立文件目录
      const targetDirs = [
        path.join(dir, 'device_database'),
        path.join(path.dirname(process.execPath), 'device_database'),
        path.join(process.cwd(), 'device_database'),
      ];

      const profiles = dbData.profiles || (Array.isArray(dbData) ? dbData : []);
      targetDirs.forEach((dbFolder) => {
        try {
          if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });
          profiles.forEach((item) => {
            const vHex = (item.hardwareFingerprint?.vendorIdHex || ('0x' + (item.vendorId || item.deviceProfile?.vendorId || 0x1ca6).toString(16))).toUpperCase();
            const pHex = (item.hardwareFingerprint?.productIdHex || ('0x' + (item.productId || item.deviceProfile?.productId || 0x1c24).toString(16))).toUpperCase();
            const brand = (item.hardwareFingerprint?.brandName || item.deviceProfile?.brand || item.brand || '客制化').replace(/[\\/:*?"<>|\s]/g, '_');
            const model = (item.deviceProfile?.model || item.model || item.shortName || '键盘').replace(/[\\/:*?"<>|\s]/g, '_');
            const fname = `${brand}_${model}_${vHex}_${pHex}.json`;
            fs.writeFileSync(path.join(dbFolder, fname), JSON.stringify(item, null, 2), 'utf-8');
          });
        } catch (err) {}
      });

      return { success: true, path: p, count: profiles.length };
    } catch (e) {
      console.error('[DeviceDB] 保存数据库文件失败:', e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('save-device-database-bundle', async (event, payload) => {
    try {
      const { fullDb, filesMap, zipBuffer, defaultFileName } = payload || {};

      // 如果传了 defaultFileName，说明前端想要保存集合包文件到用户指定位置 (导出)
      if (defaultFileName && zipBuffer) {
        const { dialog } = require('electron');
        const res = await dialog.showSaveDialog(mainWindow, {
          title: '导出星闪全量外设数据库集合包',
          defaultPath: defaultFileName,
          filters: [
            { name: '星闪外设数据库集合包 (*.spkdb)', extensions: ['spkdb'] },
            { name: 'ZIP 压缩文件 (*.zip)', extensions: ['zip'] },
          ],
        });
        if (res.canceled || !res.filePath) return { canceled: true };

        const targetFile = res.filePath;
        fs.writeFileSync(targetFile, Buffer.from(zipBuffer));
        return { canceled: false, filePath: targetFile, fileName: path.basename(targetFile) };
      }

      // 如果是导入持久化，写入物理磁盘
      const targetDirs = [
        app.getPath('userData'),
        path.dirname(process.execPath),
        path.join(process.env.APPDATA || '', 'sparklink-playjoy-hub'),
        path.join(process.env.APPDATA || '', 'sparklink-hub'),
      ];

      targetDirs.forEach((dir) => {
        if (!dir) return;
        try {
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

          if (fullDb) {
            fs.writeFileSync(path.join(dir, 'device_db.json'), JSON.stringify(fullDb, null, 2), 'utf-8');
          }

          if (filesMap && typeof filesMap === 'object') {
            const dbFolder = path.join(dir, 'device_database');
            if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });
            Object.keys(filesMap).forEach((fname) => {
              fs.writeFileSync(path.join(dbFolder, fname), filesMap[fname], 'utf-8');
            });
          }

          if (zipBuffer) {
            fs.writeFileSync(path.join(dir, 'device_db.spkdb'), Buffer.from(zipBuffer));
          }
        } catch (e) {
          console.warn('[DeviceDB] 持久化到目录失败:', dir, e.message);
        }
      });

      return { success: true };
    } catch (err) {
      console.error('[DeviceDB] 保存集合包发生异常:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('load-device-database', async () => {
    try {
      const folderCandidates = [
        path.join(path.dirname(process.execPath), 'device_database'),
        path.join(process.cwd(), 'device_database'),
        path.join(app.getAppPath(), '..', 'device_database'),
        path.join(app.getPath('userData'), 'device_database'),
      ];

      const loadedFromFolder = [];
      let foundFolder = null;
      for (const dir of folderCandidates) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
          if (files.length > 0) {
            foundFolder = dir;
            for (const f of files) {
              try {
                const text = fs.readFileSync(path.join(dir, f), 'utf-8');
                const parsed = JSON.parse(text);
                if (parsed && (parsed.meta || parsed.hardwareFingerprint || parsed.deviceProfile)) {
                  loadedFromFolder.push(parsed);
                }
              } catch (err) {
                console.error('[DeviceDB] 解析单文件失败:', f, err);
              }
            }
            if (loadedFromFolder.length > 0) break;
          }
        }
      }

      const fileCandidates = [
        getDeviceDbPath(),
        path.join(path.dirname(process.execPath), 'device_db.json'),
        path.join(process.cwd(), 'device_db.json'),
        path.join(app.getAppPath(), '..', 'device_db.json'),
      ];

      let fileData = null;
      let foundFile = null;
      for (const p of fileCandidates) {
        if (fs.existsSync(p)) {
          try {
            const content = fs.readFileSync(p, 'utf-8');
            fileData = JSON.parse(content);
            foundFile = p;
            break;
          } catch (e) {
            console.error('[DeviceDB] 读取单一数据库失败:', p, e);
          }
        }
      }

      // 合并策略：双向汇聚。单文件目录中的独立键盘定义优先
      if (loadedFromFolder.length > 0) {
        const mergedMap = new Map();
        if (fileData?.profiles && Array.isArray(fileData.profiles)) {
          fileData.profiles.forEach(item => {
            const vid = item.hardwareFingerprint?.vendorIdDec || item.vendorId || item.deviceProfile?.vendorId;
            const pid = item.hardwareFingerprint?.productIdDec || item.productId || item.deviceProfile?.productId;
            if (vid && pid) mergedMap.set(`${vid}:${pid}`, item);
          });
        }
        loadedFromFolder.forEach(item => {
          const vid = item.hardwareFingerprint?.vendorIdDec || item.vendorId || item.deviceProfile?.vendorId;
          const pid = item.hardwareFingerprint?.productIdDec || item.productId || item.deviceProfile?.productId;
          if (vid && pid) mergedMap.set(`${vid}:${pid}`, item);
        });

        const allProfiles = Array.from(mergedMap.values());
        return {
          found: true,
          source: 'folder',
          folderPath: foundFolder,
          filePath: foundFile,
          data: {
            libVersion: fileData?.libVersion || '2026.10.15.1',
            totalDevices: allProfiles.length,
            profiles: allProfiles
          }
        };
      } else if (fileData) {
        return { found: true, source: 'file', path: foundFile, data: fileData };
      }
    } catch (e) {
      console.error('[DeviceDB] 读取数据库文件失败:', e);
    }
    return { found: false };
  });

  ipcMain.handle('export-green-patch', async (event, dbObj) => {
    const { dialog } = require('electron');
    const res = await dialog.showSaveDialog(mainWindow, {
      title: '导出星闪键盘数据库一键更新升级包',
      defaultPath: `星闪键盘数据库一键更新补丁_V${dbObj.libVersion || 'Latest'}.bat`,
      filters: [{ name: 'Windows 批处理执行脚本 (*.bat)', extensions: ['bat'] }],
    });
    if (res.canceled || !res.filePath) return { canceled: true };

    const targetBat = res.filePath;
    const dbJsonFormatted = JSON.stringify(dbObj, null, 2);
    const base64Str = Buffer.from(dbJsonFormatted, 'utf-8').toString('base64');
    const totalDevicesCount = dbObj.totalDevices || (dbObj.profiles ? dbObj.profiles.length : 0);
    const ver = dbObj.libVersion || '2026.10.15.1';
    const outDir = path.dirname(targetBat);
    const dbFolder = path.join(outDir, 'device_database');
    if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });

    const profiles = dbObj.profiles || (Array.isArray(dbObj) ? dbObj : []);
    profiles.forEach((item) => {
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
echo      - 包含适配硬件数: ${totalDevicesCount} 款键盘 / PCB (已同步单机硬件库)
echo      - 特性：免重新安装 100MB 驱动，重新启动驱动即可即刻识别调节！
echo ======================================================================
echo.
echo 按任意键退出...
pause >nul
`;

    fs.writeFileSync(targetBat, batContent.replace(/\r?\n/g, '\r\n'), 'utf-8');

    const jsonPath = path.join(path.dirname(targetBat), 'device_db.json');
    fs.writeFileSync(jsonPath, dbJsonFormatted, 'utf-8');

    return { canceled: false, batPath: targetBat, jsonPath, folderPath: dbFolder };
  });

  ipcMain.handle('download-and-install-app', async (event, downloadUrl) => {
    const https = require('https');
    const http = require('http');
    const { spawn } = require('child_process');
    const tempDir = app.getPath('temp');
    const destPath = path.join(tempDir, 'SparkLinkHub_Setup_Latest.exe');

    const downloadWithRedirects = (targetUrl, redirectCount = 0) => {
      return new Promise((resolve, reject) => {
        if (redirectCount > 6) {
          return reject(new Error('下载重定向次数过多'));
        }
        const client = targetUrl.startsWith('https:') ? https : http;
        client.get(targetUrl, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return resolve(downloadWithRedirects(res.headers.location, redirectCount + 1));
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`下载失败，服务器返回 HTTP ${res.statusCode}`));
          }
          const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
          let receivedBytes = 0;
          const fileStream = fs.createWriteStream(destPath);
          res.on('data', (chunk) => {
            receivedBytes += chunk.length;
            fileStream.write(chunk);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('download-progress', {
                receivedBytes,
                totalBytes,
                percent: totalBytes > 0 ? Math.round((receivedBytes / totalBytes) * 100) : 0,
              });
            }
          });
          res.on('end', () => {
            fileStream.end();
            resolve(destPath);
          });
          res.on('error', (err) => {
            fileStream.destroy();
            reject(err);
          });
        }).on('error', reject);
      });
    };

    try {
      await downloadWithRedirects(downloadUrl);
      setTimeout(() => {
        spawn(destPath, [], { detached: true, stdio: 'ignore' }).unref();
        app.quit();
      }, 500);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // 将渲染进程控制台日志转发到主进程终端，便于调试设备连接 / 写入流程
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[renderer] ${message}`);
  });

  // 直接加载打包好的 dist/index.html
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  mainWindow.once('ready-to-show', () => {
    // 若配置为启动时最小化到系统托盘，且有 --autostart 参数
    const isAutoStart = process.argv.includes('--autostart');
    if (isAutoStart && appSettings.launchMinimizeToTray) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // 兜底机制：若 1500ms 内因渲染延时未触发 ready-to-show，强制呈现主窗口，杜绝窗口打不开的问题
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      const isAutoStart = process.argv.includes('--autostart');
      if (!(isAutoStart && appSettings.launchMinimizeToTray)) {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  }, 1500);
}

// 唤起第二实例时的处理：将已有实例呼出到前台
app.on('second-instance', (event, commandLine, workingDirectory) => {
  showMainWindow();
});

app.whenReady().then(() => {
  createWindow();
  try {
    createTray();
  } catch (e) {
    console.warn('[Tray] 托盘初始化失败:', e);
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (appSettings.closeAction === 'exit' || isQuitting) {
      app.quit();
    }
  }
});
