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
    if (spark) {
      console.log('Auto selecting AE64-MAX:', spark.deviceId);
      callback(spark.deviceId);
    } else if (details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId);
    } else {
      callback('');
    }
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=trigger');
  
  // Wait 3 seconds for app to auto-connect
  await new Promise(r => setTimeout(r, 3000));

  const result = await win.webContents.executeJavaScript(`
    (async () => {
      const ks = window.keyboardService;
      if (!ks) return { error: 'no keyboardService on window' };

      const out = {
        connected: ks.connected,
        deviceProfile: ks.deviceProfile,
        connectedDevice: ks.connectedDevice ? {
          vendorId: ks.connectedDevice.vendorId,
          productId: ks.connectedDevice.productId,
          productName: ks.connectedDevice.productName,
        } : null,
      };

      if (ks.connected && ks.sdk) {
        try {
          out.hwDefaultAxis = await ks.getDefaultAxis();
        } catch (e) {
          out.hwDefaultAxisErr = e.message;
        }

        try {
          out.hwAxisList = await ks.getAxisList();
        } catch (e) {
          out.hwAxisListErr = e.message;
        }

        try {
          if (typeof ks.sdk.getCurrentAxis === 'function') {
            out.hwCurrentAxis = await ks.sdk.getCurrentAxis(0);
          }
        } catch (e) {
          out.hwCurrentAxisErr = e.message;
        }
      }

      return out;
    })()
  `);

  console.log('LIVE KEYBOARD PROBE RESULT:');
  console.log(JSON.stringify(result, null, 2));

  app.quit();
});
