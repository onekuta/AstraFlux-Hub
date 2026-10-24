const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const distHtml = path.join(__dirname, '../dist/index.html');

  // 1. 高级按键设置
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=advanced&profile=es68&theme=dark');
  await sleep(1800);
  let img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_title_advanced.png'), img.toPNG());
  console.log('Saved verify_title_advanced.png');

  // 2. 改键设置
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=keybinds&profile=es68&theme=dark');
  await sleep(1800);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_title_keybinds.png'), img.toPNG());
  console.log('Saved verify_title_keybinds.png');

  // 3. 触发行程设置
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=trigger&profile=es68&theme=dark');
  await sleep(1800);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_title_trigger.png'), img.toPNG());
  console.log('Saved verify_title_trigger.png');

  // 4. 灯光设置
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=lighting&profile=es68&theme=dark');
  await sleep(1800);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_title_lighting.png'), img.toPNG());
  console.log('Saved verify_title_lighting.png');

  app.quit();
});
