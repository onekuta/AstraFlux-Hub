const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 880,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const deviceURL = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=trigger&profile=ae64&theme=light`;
  await win.loadURL(deviceURL);
  await new Promise(r => setTimeout(r, 1500));

  const clickRes = await win.webContents.executeJavaScript(`
    (() => {
      // 找包含“设备主页”字样的按钮，或直接点 logo
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => el.textContent && el.textContent.trim() === '设备主页');
      if (btn) {
        btn.click();
        return 'clicked btn';
      }
      const logo = document.querySelector('.app-titlebar div[class*="cursor-pointer"]');
      if (logo) {
        logo.click();
        return 'clicked logo';
      }
      return 'not found';
    })()
  `);
  console.log('Click result:', clickRes);
  await new Promise(r => setTimeout(r, 1200));

  const imgHome = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_home_after_click.png'), imgHome.toPNG());
  console.log('Saved verify_home_after_click.png');

  app.quit();
});
