const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const outDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

async function capture(win, name) {
  const img = await win.webContents.capturePage();
  const filePath = path.join(outDir, `${name}.png`);
  fs.writeFileSync(filePath, img.toPNG());
  console.log(`Saved screenshot: ${filePath}`);
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    useContentSize: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  const { pathToFileURL } = require('url');

  // 1. 浅色模式 - 高级按键概览页
  let targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=advanced&profile=es68&theme=light`;
  await win.loadURL(targetUrl);
  await new Promise(r => setTimeout(r, 2500));
  await capture(win, 'dual_theme_advanced_overview_light');

  // 2. 浅色模式 - 点击 SOCD 卡片进入第 1 步 (选键工作台)
  await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('.panel-operation .group');
      if (card) card.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));
  await capture(win, 'dual_theme_advanced_step1_light');

  // 3. 浅色模式 - 点击下一步进入第 2 步 (规则与字符库工作台)
  await win.webContents.executeJavaScript(`
    (() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const nextBtn = allButtons.find(b => b.innerText && b.innerText.includes('下一步'));
      if (nextBtn) {
        nextBtn.click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));
  await capture(win, 'dual_theme_advanced_step2_light');

  // 4. 深色模式 - 高级按键概览与第 2 步
  targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=advanced&profile=es68&theme=dark`;
  await win.loadURL(targetUrl);
  await new Promise(r => setTimeout(r, 2000));
  await capture(win, 'dual_theme_advanced_overview_dark');

  await win.webContents.executeJavaScript(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.panel-operation .cursor-pointer'));
      const socdCard = cards.find(el => el.textContent.includes('瞬时释放') || el.textContent.includes('SOCD'));
      if (socdCard) socdCard.click();
      setTimeout(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.textContent.includes('下一步') || b.textContent.includes('规则设置'));
        if (nextBtn) nextBtn.click();
      }, 500);
    })()
  `);
  await new Promise(r => setTimeout(r, 1500));
  await capture(win, 'dual_theme_advanced_step2_dark');

  win.destroy();
  app.quit();
});
