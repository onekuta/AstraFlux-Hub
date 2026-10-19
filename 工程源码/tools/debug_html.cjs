const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 880,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=lighting&profile=es68&theme=dark`;
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1200));

  const res = await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('.nav-item.active');
      return {
        inlineStyle: el ? el.getAttribute('style') : null,
        outerHTML: el ? el.outerHTML : null,
      };
    })()
  `);
  console.log('ACTIVE_NAV_HTML:', JSON.stringify(res, null, 2));
  app.quit();
});
