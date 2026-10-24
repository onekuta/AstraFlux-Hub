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

  // 写入测试数据
  await win.webContents.executeJavaScript(`
    (() => {
      const advancedData = [
        { 
          id: 'socd-A-D', 
          type: 'SOCD', 
          name: '设定优先 (SOCD: A / D)', 
          keys: ['A', 'D'], 
          desc: '最后输入优先级 · 0ms延迟',
          data: { bind1: 'A', bind2: 'D', mode: 0, delay: 0 }
        },
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

  async function openMode(modeId) {
    await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector('button[data-mode-id="${modeId}"]');
        if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      })()
    `);
    await sleep(800);
  }

  async function clickCancel() {
    await win.webContents.executeJavaScript(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const cancelBtn = btns.find(b => b.textContent.trim() === '取消');
        if (cancelBtn) cancelBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      })()
    `);
    await sleep(800);
  }

  // 1. DKS 新建模式
  console.log('Capturing DKS new mode...');
  await openMode('DKS');
  let img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_dks_dark.png'), img.toPNG());
  await clickCancel();

  // 2. MPT 新建模式
  console.log('Capturing MPT new mode...');
  await openMode('MPT');
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_mpt_dark.png'), img.toPNG());
  await clickCancel();

  // 3. SOCD 新建模式
  console.log('Capturing SOCD new mode...');
  await openMode('SOCD');
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_socd_dark.png'), img.toPNG());
  await clickCancel();

  // 4. MT 新建模式
  console.log('Capturing MT new mode...');
  await openMode('MT');
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_mt_dark.png'), img.toPNG());
  await clickCancel();

  // 5. RS 新建模式
  console.log('Capturing RS new mode...');
  await openMode('RS');
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_rs_dark.png'), img.toPNG());
  await clickCancel();

  // 6. 从已配置列表打开已有的 DKS (测试编辑模式及删除配置按钮)
  console.log('Capturing DKS edit mode...');
  await win.webContents.executeJavaScript(`
    (() => {
      const editBtns = document.querySelectorAll('button[title="修改配置"]');
      if (editBtns[1]) editBtns[1].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    })()
  `);
  await sleep(800);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_dks_editing_with_delete.png'), img.toPNG());
  await clickCancel();

  // 7. 浅色模式 DKS
  console.log('Capturing light mode...');
  await win.webContents.executeJavaScript(`
    (() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('eweadn-theme', 'light');
    })()
  `);
  await sleep(400);
  await openMode('DKS');
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_dks_light.png'), img.toPNG());

  console.log('All clean snapshots completed!');
  app.quit();
});
