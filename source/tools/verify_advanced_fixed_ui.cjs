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

  // 1. 截图：概览模式
  let img = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_fixed_advanced_overview.png', img.toPNG());
  console.log('Saved overview shot');

  // 2. 点击 DKS 卡片进入 DKS 编辑模式
  await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('[data-mode-id="DKS"]');
      if (el) el.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  img = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_fixed_dks_editor.png', img.toPNG());
  console.log('Saved DKS shot');

  // 3. 点击取消返回概览，点击 SOCD 卡片进入 SOCD 编辑模式
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cancelBtn = btns.find(b => b.textContent && b.textContent.includes('取消'));
      if (cancelBtn) cancelBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('[data-mode-id="SOCD"]');
      if (el) el.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  img = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_fixed_socd_editor.png', img.toPNG());
  console.log('Saved SOCD shot');

  // 4. 获取详细几何信息
  const metrics = await win.webContents.executeJavaScript(`
    (() => {
      const whiteCard = document.querySelector('.panel-operation .rounded-\\\\[12px\\\\]');
      const titleBar = whiteCard ? whiteCard.firstElementChild : null;
      const scrollArea = whiteCard ? whiteCard.children[1] : null;
      const bottomBar = whiteCard ? whiteCard.children[2] : null;

      const getRect = (el) => el ? {
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        offsetHeight: el.offsetHeight,
        top: el.getBoundingClientRect().top,
        bottom: el.getBoundingClientRect().bottom,
      } : null;

      return {
        whiteCard: getRect(whiteCard),
        titleBar: getRect(titleBar),
        scrollArea: getRect(scrollArea),
        bottomBar: getRect(bottomBar),
      };
    })()
  `);
  console.log('METRICS:', JSON.stringify(metrics, null, 2));

  win.destroy();
  app.quit();
});
