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

  // 点击进入第一张高级卡片 (SOCD)
  await win.webContents.executeJavaScript(`
    document.querySelector('.panel-operation .group')?.click();
  `);
  await new Promise(r => setTimeout(r, 1200));

  // 点击下一步按钮进入规则与字符库 (Step 2)
  const clickResult = await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.textContent && b.textContent.includes('下一步'));
      if (nextBtn) {
        nextBtn.click();
        return true;
      }
      return false;
    })()
  `);
  console.log('Next button clicked:', clickResult);
  await new Promise(r => setTimeout(r, 1200));

  const img = await win.webContents.capturePage();
  const outPath = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/dual_theme_advanced_real_step2_light.png';
  fs.writeFileSync(outPath, img.toPNG());
  console.log('Saved real step 2:', outPath);

  win.destroy();
  app.quit();
});
