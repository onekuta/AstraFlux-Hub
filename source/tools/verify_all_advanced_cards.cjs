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
    show: true,
    width: 1380,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  const modes = ['END', 'MT', 'TGL', 'MPT'];

  for (const mode of modes) {
    const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + 
      `?view=device&tab=advanced&advanced_view=editor&advanced_tab=${mode}&theme=light&profile=ae64`;
    await win.loadURL(url);
    await sleep(1200);

    // 默认态
    let img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(artifactDir, `verified_card_${mode.toLowerCase()}_default.png`), img.toPNG());

    // 点击激活主绑定卡片
    await win.webContents.executeJavaScript(`
      (() => {
        const card = document.querySelector('[data-slot-id="${mode.toLowerCase()}_bind"]');
        if (card) card.click();
      })()
    `);
    await sleep(400);

    // 激活态
    img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(artifactDir, `verified_card_${mode.toLowerCase()}_active.png`), img.toPNG());

    // 点击分配按键 'W'
    await win.webContents.executeJavaScript(`
      (() => {
        const wBtn = document.querySelector('button[title="拖拽或点击填入: W"]');
        if (wBtn) wBtn.click();
      })()
    `);
    await sleep(600);

    // 已分配态
    img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(artifactDir, `verified_card_${mode.toLowerCase()}_assigned.png`), img.toPNG());
    console.log(`Verified and saved ${mode} mode states (default, active, assigned)`);
  }

  // 暗色主题下的 END 模式
  const darkEndUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + 
    `?view=device&tab=advanced&advanced_view=editor&advanced_tab=END&theme=dark&profile=ae64`;
  await win.loadURL(darkEndUrl);
  await sleep(1200);
  await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('[data-slot-id="end_bind"]');
      if (card) card.click();
    })()
  `);
  await sleep(400);
  await win.webContents.executeJavaScript(`
    (() => {
      const rBtn = document.querySelector('button[title="拖拽或点击填入: R"]');
      if (rBtn) rBtn.click();
    })()
  `);
  await sleep(600);
  const darkImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, `verified_card_end_dark_assigned.png`), darkImg.toPNG());
  console.log(`Verified and saved END mode in dark theme with assigned key`);

  win.destroy();
  app.quit();
});
