const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=es68&theme=dark';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1000));
  const res = await win.webContents.executeJavaScript(`(() => {
    function walk(rules) {
      const res = [];
      for (const r of rules) {
        if (r.cssRules) {
          res.push(...walk(r.cssRules));
        } else if (r.selectorText) {
          try {
            if (document.body.matches(r.selectorText) && (r.style.backgroundColor || r.style.background)) {
              res.push({
                selector: r.selectorText,
                bg: r.style.backgroundColor || r.style.background,
                parent: r.parentRule ? r.parentRule.constructor.name : 'root'
              });
            }
          } catch(e) {}
        }
      }
      return res;
    }

    const all = [];
    for (const sheet of document.styleSheets) {
      try {
        all.push(...walk(sheet.cssRules));
      } catch (e) {
        all.push({ err: e.message });
      }
    }
    return all;
  })()`);
  console.log('RULES ON BODY:', JSON.stringify(res, null, 2));
  app.quit();
});
