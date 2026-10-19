const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false });
  const distUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=performance&profile=es68&theme=light';
  await win.loadURL(distUrl);
  await new Promise(r => setTimeout(r, 1500));
  const res = await win.webContents.executeJavaScript(`
    Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent.trim(),
      classes: b.className
    }))
  `);
  console.log('Buttons:', JSON.stringify(res, null, 2));
  win.destroy();
  app.quit();
});
