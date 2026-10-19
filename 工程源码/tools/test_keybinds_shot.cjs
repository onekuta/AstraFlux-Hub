const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1260,
    height: 800,
    show: true,
    backgroundColor: '#EBEDF0',
    webPreferences: { contextIsolation: false, nodeIntegration: false }
  });

  // 1. 1260x800 最小窗口
  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
    search: 'view=device&tab=keybinds&profile=ae64max'
  });
  await new Promise((r) => setTimeout(r, 2000));

  let img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_keybinds_1260x800.png'), img.toPNG());
  console.log('Saved verify_keybinds_1260x800.png');

  // 2. 1600x950 放大窗口
  win.setBounds({ width: 1600, height: 950 });
  await new Promise((r) => setTimeout(r, 1500));

  img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_keybinds_1600x950.png'), img.toPNG());
  console.log('Saved verify_keybinds_1600x950.png');

  // 3. 1920x1080 全高清窗口
  win.setBounds({ width: 1920, height: 1080 });
  await new Promise((r) => setTimeout(r, 1500));

  img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_keybinds_1920x1080.png'), img.toPNG());
  console.log('Saved verify_keybinds_1920x1080.png');

  win.close();
  app.quit();
});
