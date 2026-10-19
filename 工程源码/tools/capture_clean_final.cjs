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

  // 初始化测试数据
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

  async function clickCancel() {
    await win.webContents.executeJavaScript(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const cancelBtn = btns.find(b => b.textContent.trim() === '取消');
        if (cancelBtn) {
          const propKey = Object.keys(cancelBtn).find(k => k.startsWith('__reactProps'));
          if (propKey && cancelBtn[propKey].onClick) {
            cancelBtn[propKey].onClick({ stopPropagation: () => {}, preventDefault: () => {} });
          } else {
            cancelBtn.click();
          }
        }
      })()
    `);
    await sleep(1000);
  }

  // 1. DKS 新建
  await win.webContents.executeJavaScript(`
    (() => {
      const btn = document.querySelector('button[data-mode-id="DKS"]');
      if (btn) {
        const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
        if (propKey && btn[propKey].onClick) btn[propKey].onClick({ stopPropagation: () => {} });
        else btn.click();
      }
    })()
  `);
  await sleep(1000);
  let img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'dks_new_mode.png'), img.toPNG());
  await clickCancel();

  // 2. DKS 编辑已有
  await win.webContents.executeJavaScript(`
    (() => {
      const editBtns = document.querySelectorAll('button[title="修改配置"]');
      if (editBtns && editBtns[1]) {
        const btn = editBtns[1];
        const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
        if (propKey && btn[propKey].onClick) btn[propKey].onClick({ stopPropagation: () => {} });
        else btn.click();
      }
    })()
  `);
  await sleep(1000);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'dks_edit_existing_mode.png'), img.toPNG());
  await clickCancel();

  // 3. MPT 新建
  await win.webContents.executeJavaScript(`
    (() => {
      const btn = document.querySelector('button[data-mode-id="MPT"]');
      if (btn) {
        const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
        if (propKey && btn[propKey].onClick) btn[propKey].onClick({ stopPropagation: () => {} });
        else btn.click();
      }
    })()
  `);
  await sleep(1000);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mpt_new_mode.png'), img.toPNG());
  await clickCancel();

  // 4. SOCD 新建
  await win.webContents.executeJavaScript(`
    (() => {
      const btn = document.querySelector('button[data-mode-id="SOCD"]');
      if (btn) {
        const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
        if (propKey && btn[propKey].onClick) btn[propKey].onClick({ stopPropagation: () => {} });
        else btn.click();
      }
    })()
  `);
  await sleep(1000);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'socd_new_mode.png'), img.toPNG());
  await clickCancel();

  // 5. MT 新建
  await win.webContents.executeJavaScript(`
    (() => {
      const btn = document.querySelector('button[data-mode-id="MT"]');
      if (btn) {
        const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
        if (propKey && btn[propKey].onClick) btn[propKey].onClick({ stopPropagation: () => {} });
        else btn.click();
      }
    })()
  `);
  await sleep(1000);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mt_new_mode.png'), img.toPNG());
  await clickCancel();

  console.log('Finished capturing all clean shots!');
  app.quit();
});
