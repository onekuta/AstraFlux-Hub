const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&theme=dark&profile=ae64';
  await win.loadURL(targetUrl);
  await new Promise(r => setTimeout(r, 2000));

  const diag = await win.webContents.executeJavaScript(`
    (() => {
      const b16 = document.querySelector('button[data-mode-label="L16"]');
      b16.click();
      return {
        clicked: !!b16
      };
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const details = await win.webContents.executeJavaScript(`
    (() => {
      const b11 = document.querySelector('button[data-mode-label="L11"]');
      const b16 = document.querySelector('button[data-mode-label="L16"]');
      return {
        b11: {
          className: b11.className,
          style: b11.getAttribute('style')
        },
        b16: {
          className: b16.className,
          style: b16.getAttribute('style')
        }
      };
    })()
  `);
  console.log('Details:', details);
  app.quit();
});
