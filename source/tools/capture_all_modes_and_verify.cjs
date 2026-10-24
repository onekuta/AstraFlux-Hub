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

  async function clickElem(selector) {
    return await win.webContents.executeJavaScript(`
      (() => {
        const el = document.querySelector('${selector}');
        if (!el) return false;
        const propKey = Object.keys(el).find(k => k.startsWith('__reactProps'));
        if (propKey && el[propKey].onClick) {
          el[propKey].onClick({ stopPropagation: () => {}, preventDefault: () => {} });
        } else {
          el.click();
        }
        return true;
      })()
    `);
  }

  async function clickCancel() {
    return await win.webContents.executeJavaScript(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const cancelBtn = btns.find(b => b.textContent.trim() === '取消');
        if (!cancelBtn) return false;
        const propKey = Object.keys(cancelBtn).find(k => k.startsWith('__reactProps'));
        if (propKey && cancelBtn[propKey].onClick) {
          cancelBtn[propKey].onClick({ stopPropagation: () => {}, preventDefault: () => {} });
        } else {
          cancelBtn.click();
        }
        return true;
      })()
    `);
  }

  // 1. 概览界面
  console.log('1. Overview');
  let img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_overview.png'), img.toPNG());

  // 2. 新建 DKS 模式
  console.log('2. New DKS mode');
  await clickElem('button[data-mode-id="DKS"]');
  await sleep(800);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_dks_dark.png'), img.toPNG());
  await clickCancel();
  await sleep(600);

  // 3. 编辑已有 DKS (点击修改配置按钮)
  console.log('3. Edit existing DKS');
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
  await sleep(800);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_dks_editing_dark.png'), img.toPNG());
  await clickCancel();
  await sleep(600);

  // 4. 新建 MPT 模式
  console.log('4. New MPT mode');
  await clickElem('button[data-mode-id="MPT"]');
  await sleep(800);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_mpt_dark.png'), img.toPNG());
  await clickCancel();
  await sleep(600);

  // 5. 新建 SOCD 模式
  console.log('5. New SOCD mode');
  await clickElem('button[data-mode-id="SOCD"]');
  await sleep(800);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_socd_dark.png'), img.toPNG());
  await clickCancel();
  await sleep(600);

  // 6. 新建 MT 模式
  console.log('6. New MT mode');
  await clickElem('button[data-mode-id="MT"]');
  await sleep(800);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_mt_dark.png'), img.toPNG());
  await clickCancel();
  await sleep(600);

  // 7. 切换浅色模式并拍摄 DKS 编辑与新建
  console.log('7. Light theme');
  await win.webContents.executeJavaScript(`
    localStorage.setItem('eweadn-theme', 'light');
    document.documentElement.classList.remove('dark');
  `);
  await win.reload();
  await sleep(1500);

  await clickElem('button[data-mode-id="DKS"]');
  await sleep(800);
  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_clean_dks_light.png'), img.toPNG());

  console.log('Done capturing all modes!');
  app.quit();
});
