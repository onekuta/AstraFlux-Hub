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
    const matched = [];
    
    function walk(rules) {
      for (let r of rules) {
        if (r.cssRules) {
          walk(r.cssRules);
        } else if (r.selectorText) {
          try {
            if (el.matches(r.selectorText)) {
              matched.push({
                selector: r.selectorText,
                bg: r.style.backgroundColor || r.style.background,
                color: r.style.color,
                cssText: r.cssText
              });
            }
          } catch(e) {}
        }
      }
    }

    for (let s of document.styleSheets) {
      try {
        walk(s.cssRules || s.rules);
      } catch(e) {}
    }
    return matched;
  })()`);
  console.log('ALL MATCHED RULES ON EL:', JSON.stringify(res, null, 2));
  app.quit();
});
