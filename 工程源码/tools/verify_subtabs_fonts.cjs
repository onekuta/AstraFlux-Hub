const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 880,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 1. 死区设置
  const urlDeadzone = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=trigger&subtab=deadzone&profile=es68&theme=light';
  await win.loadURL(urlDeadzone);
  await new Promise(r => setTimeout(r, 1500));
  const imgDeadzone = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_font_deadzone.png'), imgDeadzone.toPNG());
  console.log('Saved verify_font_deadzone.png');

  // 2. 轴体设置
  const urlSwitches = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=trigger&subtab=switch&profile=es68&theme=light';
  await win.loadURL(urlSwitches);
  await new Promise(r => setTimeout(r, 1500));
  const imgSwitches = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_font_switches.png'), imgSwitches.toPNG());
  console.log('Saved verify_font_switches.png');

  win.destroy();
  app.quit();
});
