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

  // Click "进入驱动" on AE64 card
  const entered = await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enterBtn = btns.find(b => b.innerText && b.innerText.includes('进入驱动'));
      if (enterBtn) {
        enterBtn.click();
        return true;
      }
      return false;
    })()
  `);
  console.log('Entered driver:', entered);
  await new Promise(r => setTimeout(r, 2000));

  // Click RGB lighting tab
  const tabClicked = await win.webContents.executeJavaScript(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const lightTab = tabs.find(b => b.innerText && (b.innerText.includes('灯光') || b.innerText.includes('灯效') || b.innerText.includes('RGB')));
      if (lightTab) {
        lightTab.click();
        return { ok: true, name: lightTab.innerText.trim() };
      }
      return { ok: false };
    })()
  `);
  console.log('Lighting tab clicked:', tabClicked);
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
        return { clicked: false, allBtns: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean).slice(0, 20) };
      })()
    `);
    console.log(`Click ${m}:`, clickRes);

    await new Promise(r => setTimeout(r, 1200));

    const shot = await win.capturePage();
    const filename = `app_final_verified_${m}.png`;
    fs.writeFileSync(path.join(artifactDir, filename), shot.toPNG());
    console.log(`Saved screenshot: ${filename}`);
  }

  app.quit();
});
