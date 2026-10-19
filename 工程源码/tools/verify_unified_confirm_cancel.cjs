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
    height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const urlAdvanced = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=es68&theme=dark';
  await win.loadURL(urlAdvanced);
  await new Promise(r => setTimeout(r, 1500));

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
        },
        {
          id: 'mpt-E',
          type: 'MPT',
          name: '多段触发 (MPT: E)',
          keys: ['E'],
          desc: '3阶段深度触发',
          data: { bind: 'E', stages: [{ key: 'E', depth: 0.5 }, { key: 'Q', depth: 1.2 }, { key: 'R', depth: 2.0 }] }
        }
      ];
      localStorage.setItem('eweadn-theme', 'dark');
      localStorage.setItem('sparklink_configured_higher_keys_profile_es68', JSON.stringify(advancedData));
    })()
  `);
  await win.reload();
  await new Promise(r => setTimeout(r, 1500));

  // 1. 打开 DKS 已配置项
  console.log('1. Opening DKS config item...');
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
  await new Promise(r => setTimeout(r, 800));

  const imgDks = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_unified_dks_fixed.png'), imgDks.toPNG());

  // 2. 点击真正的“取消”按钮返回概览
  console.log('2. Clicking cancel button in DKS editor...');
  await win.webContents.executeJavaScript(`
    (() => {
      const cancelBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === '取消');
      if (cancelBtns.length > 0) {
        const btn = cancelBtns[0];
        const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
        if (propKey && btn[propKey].onClick) btn[propKey].onClick({ stopPropagation: () => {} });
        else btn.click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const imgAfterCancel = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_unified_returned_overview.png'), imgAfterCancel.toPNG());

  // 3. 打开 MPT
  console.log('3. Opening MPT new config...');
  await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('button[data-mode-id="MPT"]');
      if (card) {
        const propKey = Object.keys(card).find(k => k.startsWith('__reactProps'));
        if (propKey && card[propKey].onClick) card[propKey].onClick({ stopPropagation: () => {} });
        else card.click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const imgMpt = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_unified_mpt_fixed.png'), imgMpt.toPNG());

  // 4. 返回概览后打开 SOCD
  console.log('4. Returning to overview then opening SOCD...');
  await win.webContents.executeJavaScript(`
    (() => {
      const cancelBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === '取消');
      if (cancelBtns.length > 0) {
        const btn = cancelBtns[0];
        const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
        if (propKey && btn[propKey].onClick) btn[propKey].onClick({ stopPropagation: () => {} });
        else btn.click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('button[data-mode-id="SOCD"]');
      if (card) {
        const propKey = Object.keys(card).find(k => k.startsWith('__reactProps'));
        if (propKey && card[propKey].onClick) card[propKey].onClick({ stopPropagation: () => {} });
        else card.click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const imgSocd = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_unified_socd_fixed.png'), imgSocd.toPNG());

  // 5. 切换为浅色主题并打开 MT
  console.log('5. Light theme MT test...');
  await win.webContents.executeJavaScript(`
    (() => {
      const cancelBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === '取消');
      if (cancelBtns.length > 0) {
        const btn = cancelBtns[0];
        const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
        if (propKey && btn[propKey].onClick) btn[propKey].onClick({ stopPropagation: () => {} });
        else btn.click();
      }
      document.documentElement.classList.remove('dark');
      localStorage.setItem('eweadn-theme', 'light');
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('button[data-mode-id="MT"]');
      if (card) {
        const propKey = Object.keys(card).find(k => k.startsWith('__reactProps'));
        if (propKey && card[propKey].onClick) card[propKey].onClick({ stopPropagation: () => {} });
        else card.click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const imgMtLight = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_unified_mt_light.png'), imgMtLight.toPNG());

  console.log('All verification snapshots completed!');
  app.quit();
});
