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

  // 写入一组测试数据并重载页面
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
          id: 'dks-Q',
          type: 'DKS',
          name: '动态行程 (DKS: Q)',
          keys: ['Q'],
          desc: '4段行程指令映射',
          data: { bind: 'Q' }
        }
      ];
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('sparklink_configured_higher_keys_')) {
          localStorage.setItem(k, JSON.stringify(advancedData));
        }
      });
      localStorage.setItem('sparklink_configured_higher_keys_profile_es68', JSON.stringify(advancedData));
    })()
  `);
  await win.reload();
  await new Promise(r => setTimeout(r, 1800));

  // 1. 点击已配置列表中的 SOCD 卡片修改按钮进入编辑器
  await win.webContents.executeJavaScript(`
    (() => {
      const editBtn = document.querySelector('button[title="修改配置"]');
      if (editBtn) {
        const propKey = Object.keys(editBtn).find(k => k.startsWith('__reactProps'));
        if (propKey && editBtn[propKey].onClick) {
          editBtn[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
        } else {
          editBtn.click();
        }
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 测量并截图
  const socdMeasure = await win.webContents.executeJavaScript(`
    (() => {
      const topEl = document.querySelector('.keyboard-section-top');
      const bottomEl = document.querySelector('.panel-operation-bottom');
      return {
        top: topEl ? topEl.offsetHeight : 0,
        bottom: bottomEl ? bottomEl.offsetHeight : 0,
        ratio: topEl && bottomEl ? (topEl.offsetHeight / (topEl.offsetHeight + bottomEl.offsetHeight)).toFixed(3) : null
      };
    })()
  `);
  console.log('SOCD Editor 5:5 measure:', socdMeasure);
  const socdImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_socd_editor_50_50.png'), socdImg.toPNG());

  // 2. 点击取消返回概览
  await win.webContents.executeJavaScript(`
    (() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === '取消');
      if (cancelBtn) cancelBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 3. 点击 DKS 卡片进入 DKS 编辑器
  await win.webContents.executeJavaScript(`
    (() => {
      const textEl = Array.from(document.querySelectorAll('*')).find(el => el.textContent && el.textContent.includes('动态行程 (DKS: Q)'));
      const card = textEl ? textEl.closest('.cursor-pointer') : null;
      if (card) {
        const propKey = Object.keys(card).find(k => k.startsWith('__reactProps'));
        if (propKey && card[propKey].onClick) {
          card[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
        } else {
          card.click();
        }
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const dksMeasure = await win.webContents.executeJavaScript(`
    (() => {
      const topEl = document.querySelector('.keyboard-section-top');
      const bottomEl = document.querySelector('.panel-operation-bottom');
      return {
        top: topEl ? topEl.offsetHeight : 0,
        bottom: bottomEl ? bottomEl.offsetHeight : 0,
        ratio: topEl && bottomEl ? (topEl.offsetHeight / (topEl.offsetHeight + bottomEl.offsetHeight)).toFixed(3) : null
      };
    })()
  `);
  console.log('DKS Editor 5:5 measure:', dksMeasure);
  const dksImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_dks_editor_50_50.png'), dksImg.toPNG());

  console.log('Done verifying editors!');
  app.quit();
});
