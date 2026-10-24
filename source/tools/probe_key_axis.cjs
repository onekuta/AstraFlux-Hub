const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);
  win.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    const spark = details.deviceList.find(d => (d.vendorId === 0x1ca6 || d.vendorId === 7334) && (d.productId === 0x300d || d.productId === 12301));
    callback(spark ? spark.deviceId : (details.deviceList[0]?.deviceId || ''));
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=trigger');
  
  await new Promise(r => setTimeout(r, 2500));

  const result = await win.webContents.executeJavaScript(`
    (async () => {
      const ks = window.keyboardService;
      if (!ks || !ks.connected) return { error: 'not connected' };

      const perfKeys = {};
      // Test reading Esc (row 1, col 0) and Space (row 5, col 6)
      try {
        perfKeys.esc = await ks.getPerformance(1, 0);
        perfKeys.space = await ks.getPerformance(5, 6);
        perfKeys.w = await ks.getPerformance(2, 2);
      } catch (e) {
        perfKeys.err = e.message;
      }

      return {
        connected: ks.connected,
        perfKeys
      };
    })()
  `);

  console.log('REAL KEYBOARD PERFORMANCE PROBE RESULT:');
  console.log(JSON.stringify(result, null, 2));

  app.quit();
});
