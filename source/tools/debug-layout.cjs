const { app, BrowserWindow } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('no-sandbox');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1440, height: 900, show: false });
  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), { search: 'view=device&tab=advanced&profile=ae64' });
  await new Promise(r => setTimeout(r, 1500));

  await win.webContents.executeJavaScript(`
    const c = Array.from(document.querySelectorAll('div, button')).find(el => el.textContent && el.textContent.includes('设定优先 (SOCD)'));
    if (c) c.click();
  `);
  await new Promise(r => setTimeout(r, 800));

  const info = await win.webContents.executeJavaScript(`
    (() => {
      const panel = document.querySelector('.panel-operation');
      return Array.from(panel.querySelectorAll('*')).map(el => ({
        tag: el.tagName,
        cls: el.className.slice(0, 40),
        txt: el.textContent?.slice(0, 20),
        w: el.offsetWidth,
        h: el.offsetHeight,
        top: el.offsetTop
      })).filter(x => x.h > 10);
    })()
  `);
  console.log('PANEL SUB ELEMENTS:', JSON.stringify(info.slice(0, 15), null, 2));

  win.close();
  app.quit();
});
