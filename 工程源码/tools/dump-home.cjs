// 打包版首页 / 驱动页验收探针（纯数据回显，不出截图）
// 用法: node tools/dump-home.cjs [cdpBaseUrl] [queryString]
const http = require('http');

const base = process.argv[2] || 'http://127.0.0.1:9333';
const search = process.argv[3] || '';

const get = (p) =>
  new Promise((res, rej) => {
    http
      .get(p, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => res(d));
      })
      .on('error', rej);
  });

(async () => {
  const list = JSON.parse(await get(base + '/json'));
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = {};
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      pending[i] = r;
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending[m.id]) pending[m.id](m);
  };
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.result && r.result.exceptionDetails) {
      return 'JS_ERROR ' + JSON.stringify(r.result.exceptionDetails.text);
    }
    return r.result && r.result.result && r.result.result.value;
  };
  await new Promise((r) => {
    ws.onopen = r;
  });
  await send('Runtime.enable');

  // 回到纯净首页（或指定调试入口）
  const target = page.url.split('?')[0] + (search ? '?' + search : '');
  await send('Page.navigate', { url: target });
  await new Promise((r) => setTimeout(r, 4500));

  const out = await evalJs(`(() => {
    const cards = [...document.querySelectorAll('h3')].map(h => h.textContent.trim());
    const txt = document.body.innerText.replace(/\\s+/g, ' ');
    const countMatch = txt.match(/已接入\\s*\\d+\\s*台[^·]*/);
    const scripts = [...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src'));
    const badges = [...document.querySelectorAll('.rounded-full.font-mono')].map(e => e.textContent.trim());
    return JSON.stringify({
      url: location.href,
      bundle: scripts,
      hasSidebar: !!document.querySelector('.sidebar'),
      navItems: document.querySelectorAll('.nav-item').length,
      opPanelRadius: document.querySelector('.panel-operation')
        ? getComputedStyle(document.querySelector('.panel-operation')).borderRadius : 'n/a',
      keycaps: document.querySelectorAll('.keycap-lite, .keycap-light').length,
      keycapAll: document.querySelectorAll('[class*="keycap"]').length,
      keycapClasses: (() => {
        const set = {};
        document.querySelectorAll('[class*="keycap"]').forEach(e => {
          e.classList.forEach(c => { if (c.includes('keycap')) set[c] = (set[c] || 0) + 1; });
        });
        return set;
      })(),
      keyCountText: (txt.match(/\\(\\d+-Key[^)]*\\)/) || ['(无)'])[0],
      countText: countMatch ? countMatch[0].trim() : '(未匹配)',
      deviceCards: cards,
      cardCount: cards.length,
      rateBadges: badges.filter(b => /Hz$/.test(b)),
      vidPid: (txt.match(/0x[0-9a-f]+:0x[0-9a-f]+/gi) || []),
      hasAddCard: txt.includes('添加设备'),
      head: txt.slice(0, 200),
    }, null, 1);
  })()`);

  console.log('=== HOME_DUMP_START ===');
  console.log(out);
  console.log('=== HOME_DUMP_END ===');
  ws.close();
  process.exit(0);
})();
