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
      const cs = getComputedStyle(el);
      return {
        bgColor: cs.backgroundColor,
        bgImage: cs.backgroundImage,
        color: cs.color,
        varBgSecondary: cs.getPropertyValue('--bg-secondary'),
        testDiv: (() => {
          const d = document.createElement('div');
          d.style.background = 'var(--bg-secondary)';
          document.body.appendChild(d);
          const res = getComputedStyle(d).backgroundColor;
          d.remove();
          return res;
        })()
      };
    })()
  `);
  console.log('INFO:', info);
  app.quit();
});
