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

  // 1. 验证浅色主题 (Light Mode)
  const lightUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + 
    '?view=device&tab=advanced&advanced_view=editor&advanced_tab=DKS&theme=light&profile=es68';
  await win.loadURL(lightUrl);
  await sleep(1500);

  const lightImg = await win.webContents.capturePage();
  const lightPath = path.join(artifactDir, 'verified_dks_ui_light.png');
  fs.writeFileSync(lightPath, lightImg.toPNG());
  console.log('Saved verified_dks_ui_light.png');

  // 2. 验证暗色主题 (Dark Mode)
  const darkUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + 
    '?view=device&tab=advanced&advanced_view=editor&advanced_tab=DKS&theme=dark&profile=es68';
  await win.loadURL(darkUrl);
  await sleep(1500);

  const darkImg = await win.webContents.capturePage();
  const darkPath = path.join(artifactDir, 'verified_dks_ui_dark.png');
  fs.writeFileSync(darkPath, darkImg.toPNG());
  console.log('Saved verified_dks_ui_dark.png');

  // 3. 检查 DOM 元素关键尺寸与样式
  const domInfo = await win.webContents.executeJavaScript(`
    (() => {
      const leftCard = document.querySelector('[data-dks-row="0"]')?.closest('.w-\\\\[30\\\\%\\\\]');
      const rightCard = document.querySelector('.flex-1.min-w-0.flex.flex-col.justify-between.relative');
      const topBtns = Array.from(document.querySelectorAll('.rounded-\\\\[6px\\\\].border'));
      const topBtnTexts = topBtns.map(b => b.textContent.trim()).filter(t => t.includes('mm'));
      const verticalLines = document.querySelectorAll('.bg-zinc-200, .dark\\\\:bg-zinc-700\\\\/80');

      return {
        leftCardFound: !!leftCard,
        leftCardWidth: leftCard ? leftCard.getBoundingClientRect().width : 0,
        rightCardFound: !!rightCard,
        rightCardWidth: rightCard ? rightCard.getBoundingClientRect().width : 0,
        topBtnCount: topBtnTexts.length,
        topBtnTexts: topBtnTexts,
        verticalLineCount: verticalLines.length
      };
    })()
  `);
  console.log('DOM verification info:', JSON.stringify(domInfo, null, 2));

  win.destroy();
  app.quit();
});
