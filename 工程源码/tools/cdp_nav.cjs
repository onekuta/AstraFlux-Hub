// 打包版驱动页验收：用内置调试入口 (?view=device&profile=es68) 直接进入 ES68 驱动页并截图
const fs = require('fs');
const http = require('http');
const path = require('path');

const base = process.argv[2] || 'http://127.0.0.1:9333';
const search = process.argv[3] || 'view=device&tab=trigger&profile=es68';
const out = process.argv[4] || 'D:/desk/星闪悦动驱动/项目文档/界面预览/打包版-ES68驱动页.png';

const get = (p) => new Promise((res, rej) => {
  http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej);
});

(async () => {
  const list = JSON.parse(await get(base + '/json'));
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = {};
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) pending[m.id](m); };
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return r.result && r.result.result && r.result.result.value;
  };
  await new Promise((r) => { ws.onopen = r; });
  await send('Page.enable');
  await send('Runtime.enable');

  const target = page.url.split('?')[0] + '?' + search;
  console.log('NAV ' + target);
  await send('Page.navigate', { url: target });
  await new Promise((r) => setTimeout(r, 4000));

  const probe = await evalJs(`JSON.stringify({
    hasSidebar: !!document.querySelector('.sidebar'),
    navItems: document.querySelectorAll('.nav-item').length,
    layoutCols: document.querySelectorAll('.operation-columns').length,
    opPanelRadius: document.querySelector('.panel-operation') ? getComputedStyle(document.querySelector('.panel-operation')).borderRadius : 'n/a',
    keycaps: document.querySelectorAll('.keycap-lite, .keycap-light').length,
    textHead: document.body.innerText.replace(/\\s+/g,' ').slice(0, 260)
  })`);
  console.log('PROBES ' + probe);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log('SAVED ' + out + ' bytes=' + fs.statSync(out).size);
  ws.close();
  process.exit(0);
})();
