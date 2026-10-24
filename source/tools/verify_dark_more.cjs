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

  const targets = [
    { name: 'switch', query: '?view=device&tab=trigger&subtab=switch&profile=es68&theme=dark' },
    { name: 'deadzone', query: '?view=device&tab=trigger&subtab=deadzone&profile=es68&theme=dark' },
    { name: 'performance', query: '?view=device&tab=performance&profile=es68&theme=dark' },
    { name: 'settings', query: '?view=device&tab=settings&profile=es68&theme=dark' },
    { name: 'macro', query: '?view=device&tab=macro&profile=es68&theme=dark' }
  ];

  for (const t of targets) {
    const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + t.query;
    await win.loadURL(url);
    await new Promise(r => setTimeout(r, 1200));
    const img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(ARTIFACT_DIR, `verify_dark_${t.name}.png`), img.toPNG());
    console.log(`Saved verify_dark_${t.name}.png`);
  }
  app.quit();
});
