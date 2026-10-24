const fs = require('fs');
const http = require('http');
const path = require('path');

const base = 'http://127.0.0.1:9333';
const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/31aaf3cf-ac99-4434-84bd-f0b85977629a';

function get(p) {
  return new Promise((res, rej) => {
    http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej);
  });
}

(async () => {
  let list;
  try {
    list = JSON.parse(await get(base + '/json'));
  } catch (e) {
    console.log('CDP_UNREACHABLE ' + e.message);
    process.exit(1);
  }
  const page = list.find((t) => t.type === 'page') || list[0];
  if (!page || !page.webSocketDebuggerUrl) {
    console.log('NO_PAGE');
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = {};
  const send = (method, params = {}) =>
    new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) pending[m.id](m); };
  await new Promise((r) => { ws.onopen = r; });

  await send('Page.enable');
  await send('Runtime.enable');

  // 1. 刷新页面以加载最新的 asar 资源
  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 2200));

  // 2. 点击进入驱动
  await send('Runtime.evaluate', {
    expression: `(() => {
      const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('进入驱动'));
      if (enterBtn) enterBtn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 1200));

  // 3. 点击侧栏【快捷指令】标签页
  console.log('[1/3] 导航进入侧栏【快捷指令】...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const macroTab = document.querySelector('button[data-tab="macro"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('快捷指令'));
      if (macroTab) macroTab.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 1200));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_macro_tab.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured verify_macro_tab.png');

  // 4. 点击选择 M1 宏 (QE探头)
  console.log('[2/3] 点击选中 M1 宏...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const m1Btn = btns.find(b => b.textContent && b.textContent.includes('M1'));
      if (m1Btn) m1Btn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_macro_m1.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured verify_macro_m1.png');

  // 5. 切换到【改键配置】并点击【快捷指令】分类
  console.log('[3/3] 导航到【改键配置】中的【快捷指令】分类...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const keybindTab = document.querySelector('button[data-tab="keybinds"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('改键配置'));
      if (keybindTab) keybindTab.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 1000));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const catBtn = btns.find(b => b.textContent && b.textContent.trim() === '快捷指令');
      if (catBtn) catBtn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 800));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_keybinds_macro.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured verify_keybinds_macro.png');

  console.log('MACRO VERIFICATION COMPLETE');
  ws.close();
  process.exit(0);
})();
