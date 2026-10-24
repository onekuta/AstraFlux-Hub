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
    const el = document.elementFromPoint(500, 300);
    return {
      transition: getComputedStyle(el).transition,
      animation: getComputedStyle(el).animation,
      opacity: getComputedStyle(el).opacity,
      visibility: getComputedStyle(el).visibility,
      display: getComputedStyle(el).display
    };
  })()`);
  console.log('TRANSITION:', res);
  app.quit();
});
