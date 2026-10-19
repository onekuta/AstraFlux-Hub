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
    function findRule(rules) {
      for (let r of rules) {
        if (r.cssRules) {
          const found = findRule(r.cssRules);
          if (found) return found;
        } else if (r.cssText && r.cssText.includes('surface-solid-secondary')) {
          if (r.cssText.includes('background')) {
            return {
              selectorText: r.selectorText,
              cssText: r.cssText,
              parentRule: r.parentRule?.constructor?.name,
              layerName: r.parentRule?.name
            };
          }
        }
      }
      return null;
    }
    return findRule(document.styleSheets[0].cssRules);
  })()`);
  console.log('SURFACE RULE IN DOM:', JSON.stringify(res, null, 2));
  app.quit();
});
