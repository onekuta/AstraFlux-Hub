const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=es68&theme=dark';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));
  const res = await win.webContents.executeJavaScript(`(() => {
    return {
      htmlTag: document.documentElement.outerHTML.slice(0, 150),
      bodyTag: document.body.outerHTML.slice(0, 150),
      appShellTag: document.querySelector('.app-shell')?.outerHTML.slice(0, 150),
      profileTabTag: document.querySelector('.profile-tab')?.outerHTML.slice(0, 150) || 'no profile-tab',
      allClassesOnAppShell: document.querySelector('.app-shell')?.className
    };
  })()`);
  console.log('DEBUG TAGS:', res);
  app.quit();
});
