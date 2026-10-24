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
      contextIsolation: false,
    }
  });

  const homeURL = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=home&theme=light`;
  await win.loadURL(homeURL);
  await new Promise(r => setTimeout(r, 1000));

  await win.webContents.executeJavaScript(`
    (() => {
      const dev = {
        vendorId: 0x1ca6,
        productId: 0x300d,
        productName: 'AE64-MAX',
        opened: true,
        collections: [{ usagePage: 0xff00, usage: 1 }],
        open: async () => {},
        close: async () => {},
        sendReport: async () => {},
        receiveFeatureReport: async () => new Uint8Array(64),
        addEventListener: () => {},
        removeEventListener: () => {}
      };
      if (!navigator.hid) navigator.hid = {};
      navigator.hid.getDevices = async () => [dev];
      
      const refreshBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('检索连接设备'));
      if (refreshBtn) refreshBtn.click();
    })()
  `);
  // 等待检索并重新渲染出卡片
  await new Promise(r => setTimeout(r, 2000));

  const imgLight = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_home_ae64_card_light_fixed.png'), imgLight.toPNG());
  console.log('Saved verified_home_ae64_card_light_fixed.png');

  app.quit();
});
