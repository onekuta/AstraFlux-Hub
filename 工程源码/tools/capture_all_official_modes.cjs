const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
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

  await win.loadURL('https://v2-dev.xsyd.top/lighting');
  await new Promise(r => setTimeout(r, 3000));

  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  // Test modes L7 to L19
  for (let m = 7; m <= 19; m++) {
    console.log(`Clicking L${m} on official site...`);
    await win.webContents.executeJavaScript(`
      (() => {
        const items = document.querySelectorAll('.dynamic-item');
        if (items[${m - 1}]) {
          items[${m - 1}].click();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    const shot = await win.capturePage();
    fs.writeFileSync(path.join(artifactDir, `official_L${m}_real.png`), shot.toPNG());
    console.log(`Saved official_L${m}_real.png`);
  }

  app.quit();
});
