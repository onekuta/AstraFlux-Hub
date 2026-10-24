const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const sleep = ms => new Promise(r => setTimeout(r, ms));

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1380,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // 1. END 模式
  const urlEnd = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + 
    '?view=device&tab=advanced&advanced_view=editor&advanced_tab=END&theme=light&profile=ae64';
  await win.loadURL(urlEnd);
  await sleep(1500);

  // 点击激活卡片
  await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('[data-slot-id="end_bind"]');
      if (card) card.click();
    })()
  `);
  await sleep(500);

  // 点击 Q 按键
  await win.webContents.executeJavaScript(`
    (() => {
      const qBtn = document.querySelector('button[title="拖拽或点击填入: Q"]');
      if (qBtn) qBtn.click();
    })()
  `);
  await sleep(800);

  const endImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verified_card_end_assigned.png'), endImg.toPNG());
  console.log('Saved verified_card_end_assigned.png');

  // 2. MT 模式
  const urlMt = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + 
    '?view=device&tab=advanced&advanced_view=editor&advanced_tab=MT&theme=light&profile=ae64';
  await win.loadURL(urlMt);
  await sleep(1500);

  // 点击激活卡片
  await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('[data-slot-id="mt_bind"]');
      if (card) card.click();
    })()
  `);
  await sleep(500);

  // 点击 Space 按键
  await win.webContents.executeJavaScript(`
    (() => {
      const spaceBtn = document.querySelector('button[title="拖拽或点击填入: Space"]');
      if (spaceBtn) spaceBtn.click();
    })()
  `);
  await sleep(800);

  const mtImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verified_card_mt_assigned.png'), mtImg.toPNG());
  console.log('Saved verified_card_mt_assigned.png');

  win.destroy();
  app.quit();
});
