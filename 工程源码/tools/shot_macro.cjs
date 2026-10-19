const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1440, height: 900, useContentSize: true, show: false });
  const { pathToFileURL } = require('url');
  await win.loadURL(pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=macro&profile=es68&theme=dark');
  await new Promise(r => setTimeout(r, 2000));
  
  const img = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_macro_before.png', img.toPNG());
  console.log('Saved test_macro_before.png');
  win.destroy();
  app.quit();
});
