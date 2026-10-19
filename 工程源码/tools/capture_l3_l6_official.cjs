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
  await new Promise(r => setTimeout(r, 4000));

  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  // Test L3 (index 2) and L6 (index 5)
  for (const mIndex of [2, 5]) { // index 2 is L3, index 5 is L6
    const label = `L${mIndex + 1}`;
    console.log(`Clicking ${label} (index ${mIndex})...`);
    await win.webContents.executeJavaScript(`
      (() => {
        const items = document.querySelectorAll('.dynamic-item');
        if (items[${mIndex}]) {
          items[${mIndex}].click();
        }
      })()
    `);
    
    // Capture 3 frames to see the animation movement!
    for (let f = 1; f <= 3; f++) {
      await new Promise(r => setTimeout(r, 600));
      const shot = await win.capturePage();
      fs.writeFileSync(path.join(artifactDir, `official_${label}_frame${f}.png`), shot.toPNG());
      console.log(`Saved official_${label}_frame${f}.png`);
    }
  }

  app.quit();
});
