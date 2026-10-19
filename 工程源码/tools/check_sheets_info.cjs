const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=es68&theme=dark';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));
  const res = await win.webContents.executeJavaScript(`(() => {
    return Array.from(document.styleSheets).map(s => {
      let count = 0;
      let err = null;
      let firstRule = null;
      try {
        count = s.cssRules.length;
        firstRule = s.cssRules[0]?.cssText?.slice(0, 100);
      } catch(e) {
        err = e.message;
      }
      return { href: s.href, count, err, firstRule };
    });
  })()`);
  console.log('SHEETS INFO:', JSON.stringify(res, null, 2));
  app.quit();
});
