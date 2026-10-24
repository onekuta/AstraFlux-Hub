const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);

  win.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    console.log('[ELECTRON MAIN select-hid-device] devices:', details.deviceList.length);
    if (details.deviceList && details.deviceList.length > 0) {
      // 优先选择具备 0xffb0 的设备
      const vendorDevice = details.deviceList.find(d =>
        d.collections && d.collections.some(c => c.usagePage === 0xffb0 || (c.usagePage >= 0xff00 && c.usagePage <= 0xffff))
      );
      if (vendorDevice) {
        console.log('[ELECTRON MAIN] 选中 vendorDevice:', vendorDevice.name, vendorDevice.deviceId);
        callback(vendorDevice.deviceId);
        return;
      }
      callback(details.deviceList[0].deviceId);
    } else {
      callback('');
    }
  });

  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[RENDERER CONSOLE] ${message}`);
  });

  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=home';
  await win.loadURL(url);

  await new Promise(r => setTimeout(r, 2000));

  console.log('=== CALLING autoConnect FROM SCRIPT ===');
  const res = await win.webContents.executeJavaScript(`
    (async () => {
      try {
        const devs = await navigator.hid.getDevices();
        console.log('[PROBE SCRIPT] navigator.hid.getDevices():', devs.length, devs.map(d => ({
          name: d.productName,
          vid: '0x' + d.vendorId.toString(16),
          pid: '0x' + d.productId.toString(16),
          collections: (d.collections || []).map(c => ({ usagePage: '0x' + c.usagePage.toString(16), usage: '0x' + c.usage.toString(16) }))
        })));
        return { count: devs.length };
      } catch (e) {
        return { error: e.message };
      }
    })()
  `);
  console.log('Result:', JSON.stringify(res, null, 2));

  // 等待另外 2 秒看看自动连接是否发生
  await new Promise(r => setTimeout(r, 3000));

  app.quit();
});
