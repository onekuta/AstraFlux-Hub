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
    console.log(`[BROWSER CONSOLE ${level}] ${message} (${sourceId}:${line})`);
  });

  // 1. 测试打开 profiles 方案管理页面 (对齐用户图一 media_1792216882112_35b8f71d.png)
  const urlProfiles = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=es68&theme=light';
  await win.loadURL(urlProfiles);
  await new Promise(r => setTimeout(r, 2000));
  const imgProfiles = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_profile_manager_tab.png'), imgProfiles.toPNG());
  console.log('Saved verify_profile_manager_tab.png');

  // 2. 模拟鼠标悬浮在左侧方案管理按钮上，触发悬浮窗弹窗
  await win.webContents.executeJavaScript(`
    const btn = document.querySelector('button[data-tab="profiles"]');
    if (btn) {
      const parent = btn.parentElement;
      const opts = { bubbles: true, cancelable: true, view: window, relatedTarget: document.body };
      parent.dispatchEvent(new MouseEvent('mouseover', opts));
      parent.dispatchEvent(new MouseEvent('mouseenter', opts));
      btn.dispatchEvent(new MouseEvent('mouseover', opts));
      btn.dispatchEvent(new MouseEvent('mouseenter', opts));
    }
  `);
  await new Promise(r => setTimeout(r, 1200));
  const imgHover = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_profile_hover_menu.png'), imgHover.toPNG());
  console.log('Saved verify_profile_hover_menu.png');

  // 3. 测试点击重命名模式
  await win.webContents.executeJavaScript(`
    const editBtn = document.querySelector('button[title*="重命名"]');
    if (editBtn) editBtn.click();
  `);
  await new Promise(r => setTimeout(r, 500));
  const imgRename = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_profile_rename.png'), imgRename.toPNG());
  console.log('Saved verify_profile_rename.png');

  // 4. 测试暗黑模式下的方案管理中心与悬浮窗
  const urlDark = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=es68&theme=dark';
  await win.loadURL(urlDark);
  await new Promise(r => setTimeout(r, 1500));
  const imgDark = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_profile_manager_dark.png'), imgDark.toPNG());
  console.log('Saved verify_profile_manager_dark.png');

  // 暗色悬浮窗
  await win.webContents.executeJavaScript(`
    const btn = document.querySelector('button[data-tab="profiles"]');
    if (btn) {
      const parent = btn.parentElement;
      const opts = { bubbles: true, cancelable: true, view: window };
      parent.dispatchEvent(new MouseEvent('mouseover', opts));
    }
  `);
  await new Promise(r => setTimeout(r, 800));
  const imgDarkHover = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_profile_hover_dark.png'), imgDarkHover.toPNG());
  console.log('Saved verify_profile_hover_dark.png');

  win.destroy();
  app.quit();
});
