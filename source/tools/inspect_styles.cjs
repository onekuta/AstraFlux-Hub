const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&theme=dark&profile=ae64';
  await win.loadURL(targetUrl);
  await new Promise(r => setTimeout(r, 2000));
  
  // Click L10
  await win.webContents.executeJavaScript(`
    const btn = document.querySelector('button[data-mode-label="L10"]');
    if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  `);
  await new Promise(r => setTimeout(r, 1000));

  const report = await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button[data-mode-label]'));
      return btns.map(b => ({
        label: b.getAttribute('data-mode-label'),
        bg: window.getComputedStyle(b).backgroundColor,
        classes: b.className,
        style: b.getAttribute('style')
      }));
    })()
  `);
  const allBlue = await win.webContents.executeJavaScript(`
    (() => {
      const els = Array.from(document.querySelectorAll('*')).filter(el => {
        return (el.className && typeof el.className === 'string' && el.className.includes('#0052ef'))
            || (el.getAttribute('style') && el.getAttribute('style').includes('0, 82, 239'));
      });
      return els.map(el => ({
        tag: el.tagName,
        text: el.innerText ? el.innerText.substring(0, 30).replace(/\\n/g, ' ') : '',
        classes: el.className,
        style: el.getAttribute('style')
      }));
    })()
  `);
  console.log('All blue elements count:', allBlue.length);
  console.log(JSON.stringify(allBlue, null, 2));
  app.quit();
});
