const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&theme=dark&profile=ae64';
  await win.loadURL(targetUrl);
  await new Promise(r => setTimeout(r, 2000));
  
  const check = await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button[data-mode-label]')).map(b => ({
        label: b.getAttribute('data-mode-label'),
        style: b.getAttribute('style'),
        className: b.className
      }));
      return btns.filter(b => b.className.includes('bg-[#0052ef]') || (b.style && b.style.includes('0, 82, 239')));
    })()
  `);
  console.log('Initially active buttons:', check);

  // Click L16
  await win.webContents.executeJavaScript(`
    (() => {
      const b16 = document.querySelector('button[data-mode-label="L16"]');
      if (b16) {
        b16.click();
        b16.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const checkAfter = await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button[data-mode-label]')).map(b => ({
        label: b.getAttribute('data-mode-label'),
        style: b.getAttribute('style'),
        className: b.className
      }));
      return btns.filter(b => b.className.includes('bg-[#0052ef]') || (b.style && b.style.includes('0, 82, 239')));
    })()
  `);
  console.log('Active buttons after click:', checkAfter);
  app.quit();
});
