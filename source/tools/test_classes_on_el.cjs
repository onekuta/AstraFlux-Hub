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
    el.className = 'bg-red-500';
    const bgRed = getComputedStyle(el).backgroundColor;
    el.className = 'bg-[var(--bg-secondary)]';
    const bgSec = getComputedStyle(el).backgroundColor;
    el.className = 'bg-[var(--surface-solid-secondary)]';
    const bgSurf = getComputedStyle(el).backgroundColor;
    return { bgRed, bgSec, bgSurf };
  })()`);
  console.log('TEST CLASSES ON EL:', res);
  app.quit();
});
