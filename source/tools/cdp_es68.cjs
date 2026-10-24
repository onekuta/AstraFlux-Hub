// 打包版驱动页验收：CDP 点击 ES68 卡片「进入驱动」并截图 + 抓取关键探针
const fs = require('fs');
const http = require('http');

const base = process.argv[2] || 'http://127.0.0.1:9333';
const out = process.argv[3] || 'D:/desk/星闪悦动驱动/项目文档/界面预览/打包版-驱动页.png';

const get = (p) => new Promise((res, rej) => {
  http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej);
});

(async () => {
  const list = JSON.parse(await get(base + '/json'));
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = {};
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return r.result && r.result.result && r.result.result.value;
  };
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) pending[m.id](m); };
  await new Promise((r) => { ws.onopen = r; });
  await send('Page.enable');
  await send('Runtime.enable');

  const clicked = await evalJs(`(() => {
    if (document.querySelector('.sidebar')) return 'already-in-driver';
    const cards = [...document.querySelectorAll('div')].filter(d => {
      const t = d.innerText || '';
      return t.includes('ES68 Dawn') &&
        (t.includes('进入驱动') || t.includes('立即连接')) &&
        t.length < 220;
    });
    cards.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
    const card = cards[0];
    if (!card) return 'no-card';
    const btn = [...card.querySelectorAll('button')].find(b =>
      /进入驱动|立即连接/.test(b.textContent));
    if (!btn) return 'no-btn';
    btn.click();
    return 'clicked:' + (card.innerText || '').replace(/\\s+/g, ' ').slice(0, 80);
  })()`);
  console.log('CLICK ' + clicked);

  await new Promise((r) => setTimeout(r, 3500));

  const probe = await evalJs(`JSON.stringify({
    navItems: document.querySelectorAll('.nav-item').length,
    hasSidebar: !!document.querySelector('.sidebar'),
    layoutCols: document.querySelectorAll('.operation-columns').length,
    opPanelRadius: (document.querySelector('.panel-operation') ? getComputedStyle(document.querySelector('.panel-operation')).borderRadius : 'n/a'),
    keycaps: document.querySelectorAll('.keycap-lite, .keycap-light').length,
    textHead: document.body.innerText.replace(/\\s+/g,' ').slice(0, 320)
  })`);
  console.log('PROBES ' + probe);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.mkdirSync(require('path').dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log('SAVED ' + out + ' bytes=' + fs.statSync(out).size);
  ws.close();
  process.exit(0);
})();
