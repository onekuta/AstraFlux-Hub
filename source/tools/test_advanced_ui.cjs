const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  const distUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=es68&theme=light';
  await win.loadURL(distUrl);
  await new Promise(r => setTimeout(r, 1500));

  // 1. 点击 DKS 卡片进入 DKS 工作台
  const clickRes = await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('[data-mode-id="DKS"]');
      if (!el) return 'NO_ELEMENT';
      el.click();
      return 'CLICKED_DKS';
    })()
  `);
  console.log('DKS click result:', clickRes);
  await new Promise(r => setTimeout(r, 1200));

  // 直接进入 SOCD 工作台
  const distUrlSocd = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=es68&theme=light';
  await win.loadURL(distUrlSocd);
  await new Promise(r => setTimeout(r, 1500));

  await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('[data-mode-id="SOCD"]');
      if (el) el.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  let imgSocd = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_socd_editor_real.png', imgSocd.toPNG());
  console.log('Saved real SOCD shot');

  win.destroy();
  app.quit();
});
