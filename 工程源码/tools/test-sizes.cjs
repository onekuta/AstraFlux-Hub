const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ROOT = path.join(__dirname, '..');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1260,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(ROOT, 'electron/preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  await win.loadFile(path.join(ROOT, 'dist/index.html'), {
    search: 'view=device&tab=trigger&profile=es68',
  });

  const sizes = [
    { name: 'min_1260x800', width: 1260, height: 800 },
    { name: 'std_1440x900', width: 1440, height: 900 },
    { name: 'max_1920x1080', width: 1920, height: 1080 },
  ];

  for (const s of sizes) {
    win.setSize(s.width, s.height);
    await new Promise(r => setTimeout(r, 1500));
    const img = await win.webContents.capturePage();
    const out = `C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_size_${s.name}.png`;
    fs.writeFileSync(out, img.toPNG());
    console.log('Saved', out);
  }

  win.destroy();
  app.quit();
});
