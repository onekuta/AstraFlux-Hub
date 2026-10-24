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
  const targetDir = path.join(__dirname, 'assets/latest_light');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const scenes = [
    {
      name: 'v113_light_trigger.png',
      url: pathToFileURL(distPath).href + '?view=device&tab=trigger&profile=es68&theme=light'
    },
    {
      name: 'v113_light_performance.png',
      url: pathToFileURL(distPath).href + '?view=device&tab=performance&profile=es68&theme=light'
    },
    {
      name: 'v113_light_advanced.png',
      url: pathToFileURL(distPath).href + '?view=device&tab=advanced&profile=es68&theme=light'
    },
    {
      name: 'v113_light_lighting.png',
      url: pathToFileURL(distPath).href + '?view=device&tab=lighting&profile=es68&theme=light'
    },
    {
      name: 'v113_light_home.png',
      url: pathToFileURL(distPath).href + '?view=home&theme=light'
    }
  ];

  for (const scene of scenes) {
    console.log(`Loading light theme ${scene.name}...`);
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
