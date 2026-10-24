const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const distUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=macro&profile=es68&theme=light';
  await win.loadURL(distUrl);
  await new Promise(r => setTimeout(r, 2000));

  const img = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_macro_1100_win.png', img.toPNG());
  console.log('Saved macro 1100 shot');

  const metrics1100 = await win.webContents.executeJavaScript(`
    (() => {
      const cols = document.querySelectorAll('.panel-operation .flex.gap-3\\\\.5 > div');
      const col3 = cols[2];
      const toolbar = col3 ? col3.firstElementChild : null;
      
      return {
        col1Width: cols[0] ? cols[0].getBoundingClientRect().width : null,
        col2Width: cols[1] ? cols[1].getBoundingClientRect().width : null,
        col3Width: col3 ? col3.getBoundingClientRect().width : null,
        toolbarScrollWidth: toolbar ? toolbar.scrollWidth : null,
        toolbarClientWidth: toolbar ? toolbar.clientWidth : null,
        overflow: toolbar ? (toolbar.scrollWidth > toolbar.clientWidth) : false,
      };
    })()
  `);
  console.log('MACRO 1100 METRICS:', JSON.stringify(metrics1100, null, 2));

  win.setSize(1280, 800);
  await new Promise(r => setTimeout(r, 800));
  const img1280 = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_macro_1280_win.png', img1280.toPNG());
  console.log('Saved macro 1280 shot');

  win.destroy();
  app.quit();
});
