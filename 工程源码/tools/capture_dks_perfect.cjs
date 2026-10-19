const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const urlAdvanced = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=es68&theme=dark';
  await win.loadURL(urlAdvanced);
  await sleep(1500);

  // 写入已配置数据，包含 DKS: S
  await win.webContents.executeJavaScript(`
    (() => {
      const advancedData = [
        {
          id: 'dks-S',
          type: 'DKS',
          name: '动态键程 (DKS: S)',
          keys: ['S'],
          desc: '行程 1.40 / 3.00mm',
          data: { 
            bind: 'S', 
            shallow: 1.4, 
            deep: 3.0,
            rows: [
              { key: 'W', nodes: [true, true, true, true, false, false, false] },
              { key: '', nodes: [false, false, false, false, false, false, false] },
              { key: '', nodes: [false, false, false, false, false, false, false] },
              { key: '', nodes: [false, false, false, false, false, false, false] }
            ]
          }
        }
      ];
      localStorage.setItem('eweadn-theme', 'dark');
      localStorage.setItem('sparklink_configured_higher_keys_profile_es68', JSON.stringify(advancedData));
    })()
  `);
  await win.reload();
  await sleep(2000);

  // 点击修改配置按钮进入编辑界面
  console.log('Clicking edit button for DKS...');
  const clicked = await win.webContents.executeJavaScript(`
    (() => {
      const editBtn = document.querySelector('button[title="修改配置"]');
      if (editBtn) {
        editBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return 'edit button clicked';
      }
      return 'edit button not found';
    })()
  `);
  console.log('Result:', clicked);
  await sleep(1000);

  // 截取暗色模式下正在编辑已有 DKS 的界面
  let img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_dks_editing_dark_perfect.png'), img.toPNG());

  // 点击 取消
  console.log('Clicking cancel...');
  await win.webContents.executeJavaScript(`
    (() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '取消');
      if (cancelBtn) cancelBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    })()
  `);
  await sleep(800);

  // 切换为浅色模式并打开 DKS
  console.log('Switching to light mode and opening DKS...');
  await win.webContents.executeJavaScript(`
    (() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('eweadn-theme', 'light');
      const editBtn = document.querySelector('button[title="修改配置"]');
      if (editBtn) editBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    })()
  `);
  await sleep(1000);

  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_dks_editing_light_perfect.png'), img.toPNG());

  console.log('Done capturing DKS!');
  app.quit();
});
