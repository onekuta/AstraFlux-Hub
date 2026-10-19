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
    height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const urlMacro = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=macro&profile=es68&theme=dark';
  await win.loadURL(urlMacro);
  await new Promise(r => setTimeout(r, 2000));

  const img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_macro_text_removed.png'), img.toPNG());
  console.log('Saved verify_macro_text_removed.png successfully');
  app.quit();
});
