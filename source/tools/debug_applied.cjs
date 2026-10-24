const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880, webPreferences: { nodeIntegration: true, contextIsolation: false } });
  await win.loadURL(pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&profile=es68&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  const info = await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('.nav-item.active');
      const sheets = document.styleSheets;
      const applied = [];
      for (let s of sheets) {
        try {
          for (let r of s.cssRules) {
            if (r.selectorText && el.matches(r.selectorText)) {
              if (r.style.backgroundColor || r.style.background || r.style.color) {
                applied.push({
                  sel: r.selectorText,
                  bg: r.style.backgroundColor || r.style.background,
                  color: r.style.color
                });
              }
            }
          }
        } catch(e) {}
      }
      return applied;
    })()
  `);
  console.log('APPLIED:', info);
  app.quit();
});
