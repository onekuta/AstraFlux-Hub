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

  win.webContents.on('console-message', (event, level, message) => {
    console.log(`[Renderer] ${message}`);
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=lighting&profile=es68&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  try {
    const val1 = await win.webContents.executeJavaScript(`
      (() => {
        const keys = Array.from(document.querySelectorAll('button')).filter(b => b.title && b.title.includes('物理灯珠'));
        return keys.length > 0 ? keys[0].style.background : 'none';
      })()
    `);
    console.log('val1 at t=0:', val1);

    await new Promise(r => setTimeout(r, 600));

    const val2 = await win.webContents.executeJavaScript(`
      (() => {
        const keys = Array.from(document.querySelectorAll('button')).filter(b => b.title && b.title.includes('物理灯珠'));
        return keys.length > 0 ? keys[0].style.background : 'none';
      })()
    `);
    console.log('val2 at t=600ms:', val2);
  } catch (err) {
    console.error('JS eval error:', err);
  }

  app.quit();
});
