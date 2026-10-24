const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 880,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=lighting&profile=es68&theme=dark`;
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1200));

  const matchedRules = await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('.nav-item.active');
      const rules = [];
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && el.matches(rule.selectorText)) {
              rules.push({
                selector: rule.selectorText,
                cssText: rule.cssText
              });
            }
          }
        } catch (e) {}
      }
      return rules;
    })()
  `);
  console.log('MATCHED_RULES:', JSON.stringify(matchedRules, null, 2));
  app.quit();
});
