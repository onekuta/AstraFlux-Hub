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
    // Find what is matching el
    const rules = [];
    for (let sheet of document.styleSheets) {
      try {
        function checkRules(list) {
          for (let r of list) {
            if (r.cssRules) checkRules(r.cssRules);
            else if (r.selectorText && el.matches(r.selectorText)) {
              if (r.style.backgroundColor || r.style.background) {
                rules.push({ selector: r.selectorText, bg: r.style.backgroundColor || r.style.background });
              }
            }
          }
        }
        checkRules(sheet.cssRules || sheet.rules);
      } catch(e) {
        rules.push({ err: e.message });
      }
    }
    return rules;
  })()`);
  console.log('RULES ON CARD:', JSON.stringify(res, null, 2));
  app.quit();
});
