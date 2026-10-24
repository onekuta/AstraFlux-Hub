const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=es68&theme=dark';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));
  const res = await win.webContents.executeJavaScript(`({
    htmlTheme: document.documentElement.getAttribute('data-theme'),
    htmlClasses: document.documentElement.className,
    appShellBg: getComputedStyle(document.querySelector('.app-shell')).backgroundColor,
    headerBg: getComputedStyle(document.querySelector('.app-titlebar')).backgroundColor,
    sidebarBg: getComputedStyle(document.querySelector('.sidebar')).backgroundColor
  })`);
  console.log('DOM STATE:', res);
  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_profiles_dark.png'), img.toPNG());
  app.quit();
});
