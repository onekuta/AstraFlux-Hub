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

  // 注入已配置高级按键数据
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
  await sleep(2000);

  // 1. 截取 Overview 页面
  console.log('1. Capturing overview...');
  const imgOverview = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_overview_final.png'), imgOverview.toPNG());

  // 辅助点击函数
  async function clickEl(selector, isTextMatch = false, text = '') {
    return await win.webContents.executeJavaScript(`
      (() => {
        let el = null;
        if (${isTextMatch}) {
          const els = Array.from(document.querySelectorAll('${selector}'));
          el = els.find(e => e.textContent.trim() === '${text}');
        } else {
          el = document.querySelector('${selector}');
        }
        if (!el) return false;
        const propKey = Object.keys(el).find(k => k.startsWith('__reactProps'));
        if (propKey && el[propKey] && el[propKey].onClick) {
          el[propKey].onClick({ stopPropagation: () => {}, preventDefault: () => {} });
          return true;
        }
        el.click();
        return true;
      })()
    `);
  }

  // 2. 从已配置列表编辑 DKS (编辑已有项：包含 [删除配置] 与 [确定] [取消])
  console.log('2. Opening DKS config from list...');
  await win.webContents.executeJavaScript(`
    (() => {
      const editBtns = document.querySelectorAll('button[title="修改配置"]');
      if (editBtns[1]) {
        const btn = editBtns[1];
        const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
        if (propKey && btn[propKey].onClick) btn[propKey].onClick({ stopPropagation: () => {} });
        else btn.click();
      }
    })()
  `);
  await sleep(1000);
  const imgDksEdit = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_dks_edit_mode_final.png'), imgDksEdit.toPNG());

  // 3. 点击 取消 按钮
  console.log('3. Clicking cancel in DKS...');
  await clickEl('button', true, '取消');
  await sleep(800);
  const imgCancelled = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_cancelled_back_to_overview.png'), imgCancelled.toPNG());

  // 4. 打开新建 MPT 模式
  console.log('4. Opening new MPT config...');
  await clickEl('button[data-mode-id="MPT"]');
  await sleep(1000);
  const imgMpt = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mpt_new_mode_final.png'), imgMpt.toPNG());

  // 5. 点击 取消 按钮返回概览
  console.log('5. Clicking cancel in MPT...');
  await clickEl('button', true, '取消');
  await sleep(800);

  // 6. 打开新建 MT 模式
  console.log('6. Opening new MT config...');
  await clickEl('button[data-mode-id="MT"]');
  await sleep(1000);
  const imgMt = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mt_new_mode_final.png'), imgMt.toPNG());

  // 7. 点击 取消 按钮返回概览
  console.log('7. Clicking cancel in MT...');
  await clickEl('button', true, '取消');
  await sleep(800);

  // 8. 打开新建 SOCD 模式并切换到浅色模式
  console.log('8. Opening new SOCD in light mode...');
  await win.webContents.executeJavaScript(`
    (() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('eweadn-theme', 'light');
    })()
  `);
  await sleep(400);
  await clickEl('button[data-mode-id="SOCD"]');
  await sleep(1000);
  const imgSocdLight = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_socd_light_mode_final.png'), imgSocdLight.toPNG());

  console.log('All verification snapshots completed!');
  app.quit();
});
