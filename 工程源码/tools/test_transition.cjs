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
  const res = await win.webContents.executeJavaScript(`(async () => {
    const el = document.querySelector('[data-slot="Config1"]');
    el.style.transition = 'none';
    el.style.backgroundColor = 'blue';
    const computedImmediate = getComputedStyle(el).backgroundColor;
    await new Promise(r => setTimeout(r, 300));
    const computedAfterWait = getComputedStyle(el).backgroundColor;
    return { computedImmediate, computedAfterWait };
  })()`);
  console.log('TRANSITION TEST:', res);
  app.quit();
});
