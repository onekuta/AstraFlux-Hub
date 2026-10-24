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
    const el = document.querySelector('[data-slot="Config1"]');
    el.style.backgroundColor = '#123456';
    const bg1 = getComputedStyle(el).backgroundColor;
    el.style.backgroundColor = '';
    return { bg1 };
  })()`);
  console.log('SET HEX DIRECTLY:', res);
  app.quit();
});
