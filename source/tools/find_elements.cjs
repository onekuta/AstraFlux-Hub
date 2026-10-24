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
    function describe(el) {
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        className: el.className,
        id: el.id,
        bg: cs.backgroundColor,
        color: cs.color,
        parent: el.parentElement ? el.parentElement.className : null
      };
    }
    return {
      pt100_100: describe(document.elementFromPoint(100, 100)),
      pt500_300: describe(document.elementFromPoint(500, 300))
    };
  })()`);
  console.log('ELEMENTS AT POINTS:', JSON.stringify(res, null, 2));
  app.quit();
});
