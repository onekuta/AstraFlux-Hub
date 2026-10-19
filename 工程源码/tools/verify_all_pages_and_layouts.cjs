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

  const getPageURL = (tab, profile = 'sparklink_75') => {
    return pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=${tab}&profile=${profile}&theme=light`;
  };

  // 1. 验证 75% 配列 (MG75) + 死区模式 (修复用户图一的拉伸与挤压问题)
  await win.loadURL(getPageURL('trigger', 'sparklink_75'));
  await new Promise(r => setTimeout(r, 1500));
  await win.webContents.executeJavaScript(`
    (() => {
      const deadzoneBtn = document.querySelector('[data-preview-mode="deadzone"]');
      if (deadzoneBtn) {
        deadzoneBtn.click();
      } else {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '死区');
        if (btn) btn.click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));
  const img75Deadzone = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_75_deadzone_fixed.png'), img75Deadzone.toPNG());
  console.log('Saved verify_75_deadzone_fixed.png');

  // 2. 验证 75% 配列 (MG75) + 触发行程 (AP) 预览
  await win.webContents.executeJavaScript(`
    (() => {
      const apBtn = document.querySelector('[data-preview-mode="ap"]');
      if (apBtn) {
        apBtn.click();
      } else {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '触发行程');
        if (btn) btn.click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));
  const img75AP = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_75_ap_fixed.png'), img75AP.toPNG());
  console.log('Saved verify_75_ap_fixed.png');

  // 3. 验证 64 配列 (AE64-MAX) 触发行程页面 (确认 64 与 75 配列按键尺寸完全恒定一致)
  await win.loadURL(getPageURL('trigger', 'ae64'));
  await new Promise(r => setTimeout(r, 1500));
  const img64Trigger = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_64_trigger_constant.png'), img64Trigger.toPNG());
  console.log('Saved verify_64_trigger_constant.png');

  // 4. 验证 灯光配置 页面 (确认底部调节面板统一为 305px，键盘拉伸居中)
  await win.loadURL(getPageURL('lighting', 'ae64'));
  await new Promise(r => setTimeout(r, 1500));
  const imgLighting = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lighting_bottom_fixed.png'), imgLighting.toPNG());
  console.log('Saved verify_lighting_bottom_fixed.png');

  // 5. 验证 改键配置 页面 (确认 104 键与底部面板统一 305px)
  await win.loadURL(getPageURL('keybinds', 'ae64'));
  await new Promise(r => setTimeout(r, 1500));
  const imgKeybinds = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_keybinds_bottom_fixed.png'), imgKeybinds.toPNG());
  console.log('Saved verify_keybinds_bottom_fixed.png');

  // 6. 验证 高级按键 页面 (确认底部面板统一 305px)
  await win.loadURL(getPageURL('advanced', 'ae64'));
  await new Promise(r => setTimeout(r, 1500));
  const imgAdvanced = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_advanced_bottom_fixed.png'), imgAdvanced.toPNG());
  console.log('Saved verify_advanced_bottom_fixed.png');

  app.quit();
});
