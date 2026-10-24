const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 850,
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

  await win.loadFile(path.resolve(__dirname, '../dist/index.html'));
  await new Promise(r => setTimeout(r, 2000));

  // Enter driver
  await win.webContents.executeJavaScript(`
    (() => {
      const enter = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('进入驱动'));
      if (enter) enter.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1500));

  // Switch to lighting tab by data-tab="lighting"
  const switched = await win.webContents.executeJavaScript(`
    (() => {
      const btn = document.querySelector('button[data-tab="lighting"]');
      if (btn) {
        btn.click();
        return { ok: true, class: btn.className };
      }
      return { ok: false };
    })()
  `);
  console.log('Switched to lighting tab:', switched);
  await new Promise(r => setTimeout(r, 1500));

  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  const modes = ['L3', 'L6', 'L7', 'L1'];
  for (const m of modes) {
    console.log(`\n=== Testing ${m} in Local App ===`);
    const clickRes = await win.webContents.executeJavaScript(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === '${m}');
        if (btns.length > 0) {
          btns[0].click();
          return { clicked: true, text: btns[0].innerText.trim() };
        }
        return { clicked: false };
      })()
    `);
    console.log(`Click ${m}:`, clickRes);

    await new Promise(r => setTimeout(r, 1500));

    const shot = await win.capturePage();
    const filename = `app_real_verified_${m}.png`;
    fs.writeFileSync(path.join(artifactDir, filename), shot.toPNG());
    console.log(`Saved screenshot: ${filename}`);
  }

  app.quit();
});
