const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);
  win.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    const spark = details.deviceList.find(d => (d.vendorId === 0x1ca6 || d.vendorId === 7334) && d.productId === 0x300d);
    callback(spark ? spark.deviceId : (details.deviceList[0]?.deviceId || ''));
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=lighting');
  await new Promise(r => setTimeout(r, 2000));

  const result = await win.webContents.executeJavaScript(`
    (async () => {
      try {
        const ks = window.__KEYBOARD_SERVICE__ || window.keyboardService;
        const res = {};
        if (ks) {
          res.connected = ks.connected;
          if (ks.sdk) {
            try {
              res.lightingBase = await ks.sdk.getLightingBase('Keyboard');
            } catch (e) {
              res.lightingBaseErr = e.message;
            }
            try {
              const custom = await ks.sdk.getLightingCustom({ area: 'Keyboard', rows: 6, cols: 21 });
              res.customSample = custom ? custom.slice(0, 3).map(r => r ? r.slice(0, 5) : null) : null;
            } catch (e) {
              res.customErr = e.message;
            }
          }
        }
        return res;
      } catch (err) {
        return { err: err.message };
      }
    })()
  `);

  console.log('LIVE LIGHTING PROBE RESULT:', JSON.stringify(result, null, 2));
  app.quit();
});
