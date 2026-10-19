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

  const baseUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=trigger&subtab=switch&theme=light';
  await win.loadURL(baseUrl);
  await new Promise(r => setTimeout(r, 2000));

  async function typeSearch(query) {
    await win.webContents.executeJavaScript(`
      (() => {
        const input = document.querySelector('input[placeholder*="搜索轴体"]');
        if (input) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(input, ${JSON.stringify(query)});
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
  }

  // 1. 默认状态：常用轴体
  const img1 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_switch_tab_default.png'), img1.toPNG());
  console.log('Saved verified_switch_tab_default.png');

  // 2. 搜索 3.55
  await typeSearch('3.55');
  const img2 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_switch_search_3_55_exact.png'), img2.toPNG());
  console.log('Saved verified_switch_search_3_55_exact.png');

  // 3. 搜索 3.5
  await typeSearch('3.5');
  const img3 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_switch_search_3_5_fuzzy.png'), img3.toPNG());
  console.log('Saved verified_switch_search_3_5_fuzzy.png');

  // 4. 搜索 4.0 (常用轴体中无，提示全库)
  await typeSearch('4.0');
  const img4 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_switch_search_cross_category.png'), img4.toPNG());
  console.log('Saved verified_switch_search_cross_category.png');

  // 5. 点击切换至全库
  await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('全部校准库'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  const img5 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_switch_search_all_library_result.png'), img5.toPNG());
  console.log('Saved verified_switch_search_all_library_result.png');

  app.quit();
});
