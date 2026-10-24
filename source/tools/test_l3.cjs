const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  win.webContents.on('console-message', (e, level, msg) => console.log('[Console]', msg));

  await win.loadURL(pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&profile=es68&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  const clickL3 = await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('L3'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()
  `);
  console.log('Clicked L3:', clickL3);

  await new Promise(r => setTimeout(r, 500));

  const after = await win.webContents.executeJavaScript(`
    document.querySelector('.col span.font-mono.font-bold').textContent
  `);
  console.log('After clicking L3:', after);

  app.quit();
});
