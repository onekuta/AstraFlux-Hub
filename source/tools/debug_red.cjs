const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880, webPreferences: { nodeIntegration: true, contextIsolation: false } });
  await win.loadURL(pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&profile=es68&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  const info = await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('.nav-item.active');
      el.style.background = '#ff0000';
      const afterRed = getComputedStyle(el).backgroundColor;
      el.style.background = '';
      return { 
        afterRed,
        varBgSecOnEl: getComputedStyle(el).getPropertyValue('--bg-secondary'),
      };
    })()
  `);
  console.log('RED_TEST:', info);
  app.quit();
});
