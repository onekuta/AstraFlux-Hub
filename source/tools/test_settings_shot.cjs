const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1280, height: 800 });
  const fileUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=settings&profile=es68&theme=light';
  await win.loadURL(fileUrl);
  await new Promise(r => setTimeout(r, 2000));

  const img1280 = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/settings_current_1280.png', img1280.toPNG());
  console.log('Saved settings_current_1280.png');

  win.setSize(1100, 720);
  await new Promise(r => setTimeout(r, 500));

  const img1100 = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/settings_current_1100.png', img1100.toPNG());
  console.log('Saved settings_current_1100.png');

  win.destroy();
  app.quit();
});
