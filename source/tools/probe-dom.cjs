const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith('--' + k + '='));
  return hit ? hit.split('=').slice(1).join('=') : d;
};

const name = arg('name', 'min_1260x800');
const w = parseInt(arg('w', '1260'), 10);
const h = parseInt(arg('h', '800'), 10);
const theme = arg('theme', 'dark');
const tab = arg('tab', 'trigger');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: w,
    height: h,
    useContentSize: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  const { pathToFileURL } = require('url');
  const targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=${tab}&profile=es68&theme=${theme}`;
  await win.loadURL(targetUrl);

  await new Promise(r => setTimeout(r, 2500));

  const info = await win.webContents.executeJavaScript(`
    (() => {
      const kbBoard = document.querySelector('.relative.select-none.mx-auto');
      const kbWrap = kbBoard?.parentElement;
      const main = document.querySelector('.app-content');
      return {
        inner: { w: window.innerWidth, h: window.innerHeight },
        main: main ? { w: main.clientWidth, h: main.clientHeight, scrollH: main.scrollHeight } : null,
        kbWrap: kbWrap ? { w: kbWrap.clientWidth, h: kbWrap.clientHeight } : null,
        kbBoard: kbBoard ? { w: kbBoard.clientWidth, h: kbBoard.clientHeight } : null,
      };
    })()
  `);
  console.log(`[${name}] (${w}x${h}):`, JSON.stringify(info));

  const img = await win.webContents.capturePage();
  const out = `C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_size_${name}.png`;
  fs.writeFileSync(out, img.toPNG());
  console.log('Saved', out);
  win.destroy();
  app.quit();
});
