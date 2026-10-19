const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  const { pathToFileURL } = require('url');
  await win.loadURL(pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=es68&theme=light');
  await new Promise(r => setTimeout(r, 2000));

  // 1. 点击 DKS 卡片并进入第 2 步
  await win.webContents.executeJavaScript(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.panel-operation .group'));
      const dksCard = cards.find(c => c.textContent && c.textContent.includes('DKS'));
      if (dksCard) dksCard.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.textContent && b.textContent.includes('下一步'));
      if (nextBtn) nextBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 点击【确定】保存
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const okBtn = btns.find(b => b.textContent && b.textContent.trim() === '确定');
      if (okBtn) okBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1500));

  // 抓取保存后概览视图中底下显示的徽标和配置列表
  const img = await win.webContents.capturePage();
  const overviewShotPath = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_dks_saved_overview_light.png';
  fs.writeFileSync(overviewShotPath, img.toPNG());
  console.log('Saved overview screenshot after DKS save:', overviewShotPath);

  win.destroy();
  app.quit();
});
