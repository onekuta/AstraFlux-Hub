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
  const list = JSON.parse(await get(base + '/json'));
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = {};
  const send = (method, params = {}) =>
    new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) pending[m.id](m); };
  await new Promise((r) => { ws.onopen = r; });

  await send('Page.enable');
  await send('Runtime.enable');

  // 1. 点击侧栏【改键配置】
  await send('Runtime.evaluate', {
    expression: `(() => {
      const keybindTab = document.querySelector('button[data-tab="keybinds"]');
      if (keybindTab) keybindTab.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 800));

  // 2. 点击右侧分类横栏中的【快捷指令】按钮 (位于 panel-operation 内)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('.panel-operation');
      if (!panel) return;
      const catBtns = Array.from(panel.querySelectorAll('button'));
      const macroCatBtn = catBtns.find(b => b.textContent && b.textContent.trim() === '快捷指令');
      if (macroCatBtn) macroCatBtn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_keybinds_macro_real.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured verify_keybinds_macro_real.png');

  ws.close();
  process.exit(0);
})();
