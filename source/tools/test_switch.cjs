const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  win.webContents.on('console-message', (e, lvl, msg) => console.log('Console:', msg));
  const urlProfiles = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=ae64&theme=light';
  await win.loadURL(urlProfiles);
  await new Promise(r => setTimeout(r, 2000));
  
  // 截图 1: 初始配置一
  const img1 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_profiles_official_style.png'), img1.toPNG());
  console.log('Saved verify_profiles_official_style.png');

  // 点击 Config2
  const clickRes = await win.webContents.executeJavaScript(`
    (() => {
      const card2 = document.querySelector('[data-slot="Config2"]');
      if (card2) {
        card2.click();
        return 'clicked card2';
      }
      return 'no card2';
    })()
  `);
  console.log('Click result:', clickRes);
  await new Promise(r => setTimeout(r, 1500));

  // 截图 2: 切换到配置二
  const img2 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_profile_switch_slot2.png'), img2.toPNG());
  console.log('Saved verify_profile_switch_slot2.png');

  // 切换到触发设置 Tab 截图
  const tabRes = await win.webContents.executeJavaScript(`
    (() => {
      const trigBtn = document.querySelector('[data-tab="trigger"]');
      if (trigBtn) {
        trigBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return 'dispatched click to trigger';
      }
      return 'no trigger btn';
    })()
  `);
  console.log('Tab switch result:', tabRes);
  await new Promise(r => setTimeout(r, 1500));

  const img3 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_slot2_trigger_settings.png'), img3.toPNG());
  console.log('Saved verify_slot2_trigger_settings.png');

  app.quit();
});
