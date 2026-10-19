const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const outDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../electron/preload.cjs')
    }
  });

  // 1. Dark theme top view
  const darkUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?settings=true&section=about&theme=dark';
  await win.loadURL(darkUrl);
  await new Promise(r => setTimeout(r, 1500));

  const imageDark = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_about_page_dark.png'), imageDark.toPNG());
  console.log('Saved verified_about_page_dark.png');

  // 2. Dark theme scrolled down view (Figure 5 style)
  const scrollRes = await win.webContents.executeJavaScript(`(() => {
    const modalMain = document.querySelector('.fixed main');
    if (modalMain) {
      modalMain.scrollTop = 380;
      return { ok: true, scrollTop: modalMain.scrollTop, scrollHeight: modalMain.scrollHeight, clientHeight: modalMain.clientHeight };
    }
    return { ok: false };
  })()`);
  console.log('Scroll result:', scrollRes);
  await new Promise(r => setTimeout(r, 600));

  const imageDarkScrolled = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_about_page_dark_scrolled.png'), imageDarkScrolled.toPNG());
  console.log('Saved verified_about_page_dark_scrolled.png');

  // 3. Light theme top view
  const lightUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?settings=true&section=about&theme=light';
  await win.loadURL(lightUrl);
  await new Promise(r => setTimeout(r, 1500));

  const imageLight = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_about_page_light.png'), imageLight.toPNG());
  console.log('Saved verified_about_page_light.png');

  app.quit();
});
