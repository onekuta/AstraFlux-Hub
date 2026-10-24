const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=keybinds&profile=ae64&theme=light';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 2000));
  const res = await win.webContents.executeJavaScript(`
    (() => {
      const appContent = document.querySelector('.app-content');
      const children = Array.from(appContent.children).map(c => ({
        tag: c.tagName,
        className: c.className,
        rect: { top: c.getBoundingClientRect().top, bottom: c.getBoundingClientRect().bottom, height: c.getBoundingClientRect().height }
      }));
      return {
        appContent: {
          top: appContent.getBoundingClientRect().top,
          bottom: appContent.getBoundingClientRect().bottom,
          height: appContent.getBoundingClientRect().height,
          scrollHeight: appContent.scrollHeight
        },
        children
      };
    })()
  `);
  console.log('App content info:', JSON.stringify(res, null, 2));
  app.quit();
});
