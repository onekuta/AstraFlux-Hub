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

  const getPageURL = (tab, profile = 'es68', theme = 'dark') => {
    return pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=${tab}&profile=${profile}&theme=${theme}`;
  };

  const measureHeights = async (tabName) => {
    return await win.webContents.executeJavaScript(`
      (() => {
        const topEl = document.querySelector('.keyboard-section-top') || document.querySelector('.panel-keyboard');
        const bottomEl = document.querySelector('.panel-operation-bottom') || document.querySelector('.panel-operation-keybinds') || document.querySelector('.panel-operation');
        const contentEl = document.querySelector('.app-content');
        return {
          tab: '${tabName}',
          contentHeight: contentEl ? contentEl.clientHeight : 0,
          topHeight: topEl ? topEl.offsetHeight : 0,
          bottomHeight: bottomEl ? bottomEl.offsetHeight : 0,
          ratio: topEl && bottomEl ? (topEl.offsetHeight / (topEl.offsetHeight + bottomEl.offsetHeight)).toFixed(3) : null
        };
      })()
    `);
  };

  // 1. 验证【触发配置】(trigger) 5:5 比例与 UI
  await win.loadURL(getPageURL('trigger', 'es68', 'dark'));
  await new Promise(r => setTimeout(r, 1500));
  const triggerHeights = await measureHeights('trigger');
  console.log('Trigger heights:', triggerHeights);
  const triggerImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_trigger_50_50.png'), triggerImg.toPNG());

  // 2. 验证【改键配置】(keybinds) 5:5 比例与 UI
  await win.loadURL(getPageURL('keybinds', 'es68', 'dark'));
  await new Promise(r => setTimeout(r, 1500));
  const keybindsHeights = await measureHeights('keybinds');
  console.log('Keybinds heights:', keybindsHeights);
  const keybindsImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_keybinds_50_50.png'), keybindsImg.toPNG());

  // 3. 验证【高级按键】(advanced) 概览模式 5:5 比例与 UI
  await win.loadURL(getPageURL('advanced', 'es68', 'dark'));
  await new Promise(r => setTimeout(r, 1500));
  const advancedHeights = await measureHeights('advanced');
  console.log('Advanced heights:', advancedHeights);
  const advancedImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_advanced_50_50.png'), advancedImg.toPNG());

  // 4. 验证【高级按键】编辑模式（例如 DKS 单页工作台）
  await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('[data-mode-id="DKS"]');
      if (card) {
        const propKey = Object.keys(card).find(k => k.startsWith('__reactProps'));
        if (propKey && card[propKey].onClick) {
          card[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
          return 'invoked react onClick on DKS';
        } else {
          card.click();
          return 'fallback click DKS';
        }
      }
      return 'card not found';
    })()
  `).then(res => console.log('Click result:', res));
  await new Promise(r => setTimeout(r, 1200));
  const dksHeights = await measureHeights('advanced_dks');
  console.log('Advanced DKS heights:', dksHeights);
  const dksImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_advanced_dks_50_50.png'), dksImg.toPNG());

  // 5. 验证大窗口拉伸下的 5:5 保持情况 (1600x1050)
  win.setSize(1600, 1050);
  await new Promise(r => setTimeout(r, 1000));
  const largeHeights = await measureHeights('advanced_dks_large');
  console.log('Large window heights:', largeHeights);
  const largeImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_large_window_50_50.png'), largeImg.toPNG());

  console.log('All 50:50 screenshots and measurements successfully captured!');
  app.quit();
});
