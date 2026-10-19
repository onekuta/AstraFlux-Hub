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
          id: 'dks-S',
          type: 'DKS',
          name: '动态行程 (DKS: S)',
          keys: ['S'],
          desc: '4段行程指令映射',
          data: { bind: 'S' }
        },
        {
          id: 'mt-S',
          type: 'MT',
          name: '双效点击 (MT: S)',
          keys: ['S'],
          desc: '单击短按/长按不同触发',
          data: { bind: 'S', tapKey: 'S', holdKey: 'Shift', threshold: 200 }
        },
        {
          id: 'end-S',
          type: 'END',
          name: '松开触发 (END: S)',
          keys: ['S'],
          desc: '按下与松开双触发',
          data: { bind: 'S', downKey: 'S', upKey: 'Ctrl', delay: 0 }
        },
        {
          id: 'rs-W-S',
          type: 'RS',
          name: '深度优先急停 (RS: W / S)',
          keys: ['W', 'S'],
          desc: '深度绝对优先',
          data: { bind1: 'W', bind2: 'S', delay: 0 }
        },
        {
          id: 'mpt-S',
          type: 'MPT',
          name: '多段触发 (MPT: S)',
          keys: ['S'],
          desc: '3阶递增深度触发',
          data: { bind: 'S', stages: [{ key: 'S', depth: 0.5 }, { key: 'E', depth: 1.0 }, { key: 'R', depth: 1.5 }] }
        }
      ];
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('sparklink_configured_higher_keys_')) {
          localStorage.setItem(k, JSON.stringify(advancedData));
        }
      });
      localStorage.setItem('eweadn-theme', 'dark');
      localStorage.setItem('sparklink_configured_higher_keys_profile_es68', JSON.stringify(advancedData));
    })()
  `);
  await win.reload();
  await new Promise(r => setTimeout(r, 1800));

  // 辅助函数：通过 React 内部 props 触发编辑已配置项
  async function editItemByIndex(idx) {
    return await win.webContents.executeJavaScript(`
      (() => {
        const editBtns = document.querySelectorAll('button[title="修改配置"]');
        if (editBtns && editBtns[${idx}]) {
          const btn = editBtns[${idx}];
          const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
          if (propKey && btn[propKey].onClick) {
            btn[propKey].onClick({ stopPropagation: () => {} });
            return true;
          } else {
            btn.click();
            return true;
          }
        }
        return false;
      })()
    `);
  }

  // 1. 测试从已配置列表编辑 SOCD (A / D)
  console.log('Testing SOCD (A / D) editing...');
  await editItemByIndex(0); // SOCD A / D
  await new Promise(r => setTimeout(r, 800));
  let buf = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_capsule_socd_keys.png'), buf.toPNG());

  // 2. 点击胶囊返回列表返回概览
  console.log('Testing Capsule Click to return overview...');
  await win.webContents.executeJavaScript(`
    (() => {
      const capsuleBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.className.includes('rounded-full') && b.textContent.includes('返回列表')
      );
      if (capsuleBtn) {
        capsuleBtn.click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 3. 测试从已配置列表编辑 DKS (S)
  console.log('Testing DKS (S) editing...');
  await editItemByIndex(1); // DKS S
  await new Promise(r => setTimeout(r, 800));
  buf = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_capsule_dks_key_s.png'), buf.toPNG());

  // 4. 返回列表
  await win.webContents.executeJavaScript(`
    (() => {
      const capsuleBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.className.includes('rounded-full') && b.textContent.includes('返回列表')
      );
      if (capsuleBtn) capsuleBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 5. 测试从已配置列表编辑 MT (S)
  console.log('Testing MT (S) editing...');
  await editItemByIndex(2); // MT S
  await new Promise(r => setTimeout(r, 800));
  buf = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_capsule_mt_key_s.png'), buf.toPNG());

  // 6. 返回列表
  await win.webContents.executeJavaScript(`
    (() => {
      const capsuleBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.className.includes('rounded-full') && b.textContent.includes('返回列表')
      );
      if (capsuleBtn) capsuleBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 7. 测试从已配置列表编辑 END (S)
  console.log('Testing END (S) editing...');
  await editItemByIndex(3); // END S
  await new Promise(r => setTimeout(r, 800));
  buf = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_capsule_end_key_s.png'), buf.toPNG());

  console.log('All tests finished successfully!');
  win.close();
  app.quit();
});
