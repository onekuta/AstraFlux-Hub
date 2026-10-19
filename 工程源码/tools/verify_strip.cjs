const fs = require('fs');
const http = require('http');
const path = require('path');

const base = 'http://127.0.0.1:9333';
const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

function get(p) {
  return new Promise((res, rej) => {
    http.get(p, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => res(d));
    }).on('error', rej);
  });
}

(async () => {
  const list = JSON.parse(await get(base + '/json'));
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = {};
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) pending[m.id](m); };
  await new Promise((r) => { ws.onopen = r; });
  await send('Page.enable');
  await send('Runtime.enable');

  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r.result && r.result.result ? r.result.result.value : null;
  };

  // 点击【进入驱动】
  await evalJs(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enter = btns.find(b => (b.innerText || '').includes('进入驱动'));
    if (enter) enter.click();
  })()`);
  await new Promise(r => setTimeout(r, 1200));

  // 点击【灯光配置】
  await evalJs(`(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const lightTab = tabs.find(b => (b.innerText || '').includes('灯光配置'));
    if (lightTab) lightTab.click();
  })()`);
  await new Promise(r => setTimeout(r, 1200));

  // 点击【装饰灯1】
  await evalJs(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const stripBtn = btns.find(b => (b.innerText || '').trim() === '装饰灯1');
    if (stripBtn) stripBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 1200));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lighting_strip1_detail.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_lighting_strip1_detail.png');
  process.exit(0);
})();
