const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=es68&theme=dark';
  await win.loadURL(url);
  
  for (let t of [100, 300, 600, 1000, 1500, 2000]) {
    await new Promise(r => setTimeout(r, 200));
    const state = await win.webContents.executeJavaScript(`({
      dataTheme: document.documentElement.getAttribute('data-theme'),
      className: document.documentElement.className,
      cardBg: getComputedStyle(document.querySelector('[data-slot="Config1"]') || document.body).backgroundColor
    })`);
    console.log(`At ~${t}ms:`, state);
  }
  app.quit();
});
