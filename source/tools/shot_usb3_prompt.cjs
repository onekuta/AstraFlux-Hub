const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

const ROOT = path.join(__dirname, '..');
const artifactDir = 'C:\\Users\\Lynan\\.gemini\\antigravity\\brain\\babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: true,
    useContentSize: true,
    backgroundColor: '#EBEDF0',
    webPreferences: {
      preload: path.join(ROOT, 'electron', 'preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  // 1. 验证浅色模式 (Light mode) 弹窗
  await win.loadFile(path.join(ROOT, 'dist', 'index.html'), {
    search: 'view=device&tab=trigger&profile=dv63',
  });
  await new Promise((r) => setTimeout(r, 1500));
  await win.webContents.executeJavaScript(`
    window.__triggerUsb3Prompt && window.__triggerUsb3Prompt();
  `);
  await new Promise((r) => setTimeout(r, 600));

  const imgLight = await win.webContents.capturePage();
  const outLight = path.join(artifactDir, 'verify_usb3_prompt_light.png');
  fs.writeFileSync(outLight, imgLight.toPNG());
  console.log('SAVED LIGHT ' + outLight);

  // 2. 验证深色模式 (Dark mode) 弹窗
  await win.webContents.executeJavaScript(`
    try {
      localStorage.setItem('eweadn-theme','dark');
      document.documentElement.setAttribute('data-theme','dark');
      document.documentElement.classList.add('dark');
    } catch(e){}
  `);
  await new Promise((r) => setTimeout(r, 400));
  const imgDark = await win.webContents.capturePage();
  const outDark = path.join(artifactDir, 'verify_usb3_prompt_dark.png');
  fs.writeFileSync(outDark, imgDark.toPNG());
  console.log('SAVED DARK ' + outDark);

  app.quit();
});

app.on('window-all-closed', () => app.quit());
