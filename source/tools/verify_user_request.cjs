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

  win.webContents.on('console-message', (e, lvl, msg) => console.log('Console:', msg));

  // 1. 打开触发配置页面
  const urlTrigger = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=trigger&profile=ae64&theme=light';
  await win.loadURL(urlTrigger);
  await new Promise(r => setTimeout(r, 1800));

  // 截图 1: 触发配置页面 (验证上方面积增大60-70%，预览按钮水平居中，下方触发配置紧凑固定)
  const imgTrigger = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_trigger_enlarged_centered.png'), imgTrigger.toPNG());
  console.log('Saved verify_trigger_enlarged_centered.png');

  // 2. 加载改键配置页面 (基础分类)
  const urlKeybinds = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=keybinds&profile=ae64&theme=light';
  await win.loadURL(urlKeybinds);
  await new Promise(r => setTimeout(r, 1800));

  // 截图 2: 改键配置 - 基础 104 键全配列 (验证键盘尺寸放大饱满、圆角跟随页面、行列无缝对齐)
  const imgKeybindsBasic = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_keybinds_basic_aligned.png'), imgKeybindsBasic.toPNG());
  console.log('Saved verify_keybinds_basic_aligned.png');

  // 3. 点击进入“组合键”分类
  await win.webContents.executeJavaScript(`
    (() => {
      const comboBtn = document.querySelector('[data-category-tab="combo"]');
      if (comboBtn) comboBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  // 点击选择主键 (例如按键 C)
  await win.webContents.executeJavaScript(`
    (() => {
      const keyC = document.querySelector('[data-104-key="KeyC"]');
      if (keyC) keyC.click();
      const ctrlBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'CTRL');
      if (ctrlBtn) ctrlBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 截图 3: 改键配置 - 组合键 104 键全配列 (验证与基础分类 1:1 对齐一致，小键盘无错位，选中高亮)
  const imgKeybindsCombo = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_keybinds_combo_aligned.png'), imgKeybindsCombo.toPNG());
  console.log('Saved verify_keybinds_combo_aligned.png');

  app.quit();
});
