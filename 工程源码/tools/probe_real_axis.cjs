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

  const esmPath = pathToFileURL(path.resolve(__dirname, '../node_modules/@sparklinkplayjoy/sdk-keyboard-v2/dist/esm/index.js')).href;
  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=trigger');
  
  await new Promise(r => setTimeout(r, 2000));

  const result = await win.webContents.executeJavaScript(`
    (async () => {
      try {
        const hidDevices = await navigator.hid.getDevices();
        const ae64 = hidDevices.find(d => (d.vendorId === 0x1ca6 || d.vendorId === 7334) && (d.productId === 0x300d || d.productId === 12301) && d.collections.some(c => c.usagePage === 0xffb0));
        if (!ae64) return { error: 'ae64 not found in hid devices', count: hidDevices.length };
        if (!ae64.opened) await ae64.open();

        const SdkMod = await import("${esmPath}");
        const KeyboardSDK = SdkMod.default || SdkMod;
        const sdk = new KeyboardSDK({
          device: ae64,
          timeout: 2000
        });

        const res = {};
        try {
          res.defaultAxis = await sdk.getDefaultAxis();
        } catch (e) {
          res.defaultAxisErr = e.message;
        }

        try {
          res.currentAxis = await sdk.getCurrentAxis(0);
        } catch (e) {
          res.currentAxisErr = e.message;
        }

        try {
          res.axisList = await sdk.getAxisList();
        } catch (e) {
          res.axisListErr = e.message;
        }

        try {
          if (typeof sdk.getAxisCount === 'function') {
            res.axisCount = await sdk.getAxisCount();
          }
        } catch (e) {}

        return res;
      } catch (err) {
        return { fatal: err.message, stack: err.stack };
      }
    })()
  `);

  console.log('REAL HARDWARE PROBE RESULT:');
  console.log(JSON.stringify(result, null, 2));

  app.quit();
});
