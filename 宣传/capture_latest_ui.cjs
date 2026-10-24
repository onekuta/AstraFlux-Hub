const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const sleep = ms => new Promise(r => setTimeout(r, ms));

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1440,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const distPath = path.join(__dirname, '../工程源码/dist/index.html');
  const targetDir = path.join(__dirname, 'assets/latest');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const scenes = [
    {
      name: 'v113_trigger.png',
      url: pathToFileURL(distPath).href + '?view=device&tab=trigger&profile=es68&theme=dark'
    },
    {
      name: 'v113_performance.png',
      url: pathToFileURL(distPath).href + '?view=device&tab=performance&profile=es68&theme=dark'
    },
    {
      name: 'v113_advanced.png',
      url: pathToFileURL(distPath).href + '?view=device&tab=advanced&profile=es68&theme=dark'
    },
    {
      name: 'v113_home.png',
      url: pathToFileURL(distPath).href + '?view=home&theme=dark'
    },
    {
      name: 'v113_lighting.png',
      url: pathToFileURL(distPath).href + '?view=device&tab=lighting&profile=es68&theme=dark'
    }
  ];

  for (const scene of scenes) {
    console.log(`Loading ${scene.name}...`);
    await win.loadURL(scene.url);
    await sleep(2500);
    const img = await win.webContents.capturePage();
    const savePath = path.join(targetDir, scene.name);
    fs.writeFileSync(savePath, img.toPNG());
    console.log(`Saved: ${savePath}`);
  }

  win.destroy();
  app.quit();
});
