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
      console.log('Selecting sparklink device:', spark.productName);
      callback(spark.deviceId);
    } else if (details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId);
    } else {
      callback('');
    }
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=trigger');
  
  await new Promise(r => setTimeout(r, 2500));

  const result = await win.webContents.executeJavaScript(`
    (async () => {
      const hidDevices = await navigator.hid.getDevices();
      const devSummaries = hidDevices.map(d => ({
        vendorId: '0x' + d.vendorId.toString(16),
        productId: '0x' + d.productId.toString(16),
        productName: d.productName,
        opened: d.opened,
      }));

      const ks = window.__KEYBOARD_SERVICE__ || window.keyboardService;
      let sdkResult = {};
      if (ks) {
        sdkResult.connected = ks.connected;
        sdkResult.deviceInfo = ks.deviceInfo;
        sdkResult.deviceFeatures = ks.deviceFeatures;
        sdkResult.deviceProfile = ks.deviceProfile;
        try {
          sdkResult.defaultAxis = await ks.getDefaultAxis();
        } catch (e) {
          sdkResult.defaultAxisErr = e.message;
        }
        try {
          sdkResult.escPerf = await ks.getPerformance(1, 0);
        } catch (e) {
          sdkResult.escPerfErr = e.message;
        }
      }

      return { devSummaries, sdkResult };
    })()
  `);

  console.log('QUERY RESULT:', JSON.stringify(result, null, 2));

  app.quit();
});
