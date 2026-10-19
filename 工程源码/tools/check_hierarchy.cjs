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
    let curr = document.elementFromPoint(500, 300);
    const list = [];
    while (curr) {
      list.push({
        tag: curr.tagName,
        id: curr.id,
        class: curr.className,
        styleAttr: curr.getAttribute('style'),
        themeAttr: curr.getAttribute('data-theme'),
        computedColor: getComputedStyle(curr).color,
        computedBg: getComputedStyle(curr).backgroundColor
      });
      curr = curr.parentElement;
    }
    return list;
  })()`);
  console.log('HIERARCHY:', JSON.stringify(res, null, 2));
  app.quit();
});
