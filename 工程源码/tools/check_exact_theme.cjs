const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=es68&theme=dark';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 2000));
  const res = await win.webContents.executeJavaScript(`(() => {
    return {
      htmlTheme: document.documentElement.getAttribute('data-theme'),
      htmlClass: document.documentElement.className,
      themeStateInApp: window.__THEME_STATE__ || 'unknown',
      search: window.location.search,
      hash: window.location.hash,
      lsTheme: localStorage.getItem('eweadn-theme')
    };
  })()`);
  console.log('REAL THEME AT 2000ms:', res);
  app.quit();
});
