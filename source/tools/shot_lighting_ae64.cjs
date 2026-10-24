const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 820,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  const distHtml = path.join(__dirname, '../dist/index.html');
  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=lighting&profile=ae64_max');
  await new Promise(r => setTimeout(r, 2000));
  const shot = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'final_verify_lighting_ae64_doublelight.png'), shot.toPNG());
  console.log('Saved ae64 doublelight shot!');
  app.quit();
});
