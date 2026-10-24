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
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const getPageURL = (tab, subtab = 'trigger') => {
    return pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=${tab}&subtab=${subtab}&profile=sparklink_75&theme=light`;
  };

  // 1. 验证触发配置主页面上的防自显开关 (带对勾与高对比度按钮)
  await win.loadURL(getPageURL('trigger', 'trigger'));
  await new Promise(r => setTimeout(r, 1500));
  const imgTrigger = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_anti_ghosting_trigger_tab.png'), imgTrigger.toPNG());
  console.log('Saved verify_anti_ghosting_trigger_tab.png');

  // 2. 验证防自显说明气泡 (展示官方完整说明文本及向上小三角箭头)
  await win.loadURL(getPageURL('trigger', 'trigger') + '&showTip=true');
  await new Promise(r => setTimeout(r, 1500));
  const imgTooltip = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_anti_ghosting_tooltip_exact.png'), imgTooltip.toPNG());
  console.log('Saved verify_anti_ghosting_tooltip_exact.png');

  // 3. 验证死区设置页面 (无多余冗余重复开关，空间充裕)
  await win.loadURL(getPageURL('trigger', 'deadzone'));
  await new Promise(r => setTimeout(r, 1500));
  const imgDeadzone = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_anti_ghosting_deadzone_tab.png'), imgDeadzone.toPNG());
  console.log('Saved verify_anti_ghosting_deadzone_tab.png');

  app.quit();
});
