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
    const els = document.elementsFromPoint(500, 300);
    return els.map(e => ({
      tag: e.tagName,
      className: e.className,
      style: e.style.cssText,
      computedBg: getComputedStyle(e).backgroundColor,
      computedColor: getComputedStyle(e).color,
      zIndex: getComputedStyle(e).zIndex,
      opacity: getComputedStyle(e).opacity
    }));
  })()`);
  console.log('ELEMENTS AT POINT (PLURAL):', JSON.stringify(res, null, 2));
  app.quit();
});
