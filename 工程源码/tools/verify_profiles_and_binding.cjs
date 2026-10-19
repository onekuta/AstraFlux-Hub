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

  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] ${message}`);
  });

  const urlProfiles = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=ae64&theme=light';
  await win.loadURL(urlProfiles);
  await new Promise(r => setTimeout(r, 2000));

  // 1. 检查槽位按钮与卡片
  const info = await win.webContents.executeJavaScript(`
    (() => {
      const cards = document.querySelectorAll('[data-slot]');
      return {
        cardCount: cards.length,
        slots: Array.from(cards).map(c => c.getAttribute('data-slot'))
      };
    })()
  `);
  console.log('Slot info before:', info);

  // 2. 点击切换到 Config2
  const switchRes = await win.webContents.executeJavaScript(`
    (() => {
      const card2 = document.querySelector('[data-slot="Config2"]');
      if (card2) {
        card2.click();
        return 'clicked Config2';
      }
      return 'not found Config2';
    })()
  `);
  console.log('Switch result:', switchRes);
  await new Promise(r => setTimeout(r, 800));

  // 截图 2: 切换到配置二
  const imgSlot2 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_profile_switch_slot2.png'), imgSlot2.toPNG());
  console.log('Saved verify_profile_switch_slot2.png');

  // 3. 切回触发设置检查参数
  await win.webContents.executeJavaScript(`
    (() => {
      const trigBtn = document.querySelector('[data-tab="trigger"]');
      if (trigBtn) trigBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const imgTrigger = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_slot2_trigger_settings.png'), imgTrigger.toPNG());
  console.log('Saved verify_slot2_trigger_settings.png');

  app.quit();
});
