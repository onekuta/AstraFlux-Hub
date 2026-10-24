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
    const s = document.styleSheets[0];
    const props = [];
    for (let r of s.cssRules) {
      if (r instanceof CSSPropertyRule) {
        props.push({ name: r.name, syntax: r.syntax, inherits: r.inherits, initialValue: r.initialValue });
      }
    }
    return props.filter(p => p.name.includes('color') || p.name.includes('bg') || p.name.includes('surface') || p.name.includes('text'));
  })()`);
  console.log('REGISTERED CSS PROPERTIES:', JSON.stringify(res, null, 2));
  app.quit();
});
