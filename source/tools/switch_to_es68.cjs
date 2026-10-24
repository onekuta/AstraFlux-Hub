const http = require('http');

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
  const list = JSON.parse(await get('http://127.0.0.1:9333/json'));
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  let id = 0;
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      ws.send(JSON.stringify({ id: i, method, params }));
      const handler = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === i) {
          ws.removeEventListener('message', handler);
          r(m);
        }
      };
      ws.addEventListener('message', handler);
    });
  await new Promise((r) => { ws.onopen = r; });

  // 1. 查找切换设备按钮
  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const switchBtn = btns.find(b => (b.innerText || '').includes('AE64-MAX') && b.querySelector('svg'));
      if (switchBtn) {
        switchBtn.click();
        return 'clicked_switch_btn';
      }
      return 'not_found';
    })()`,
    returnByValue: true
  });
  console.log('Switch button click:', res?.result?.result?.value);
  await new Promise((r) => setTimeout(r, 600));

  // 2. 获取下拉项
  const items = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.map(b => (b.innerText || '').trim()).filter(Boolean);
    })()`,
    returnByValue: true
  });
  console.log('All buttons now:', items?.result?.result?.value);

  // 3. 查找并点击包含 ES68 的项
  const clickEs68 = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const es68Item = btns.find(b => (b.innerText || '').includes('ES68') || (b.innerText || '').includes('Dawn'));
      if (es68Item) {
        es68Item.click();
        return 'clicked_es68_dropdown_item';
      }
      return 'es68_item_not_found';
    })()`,
    returnByValue: true
  });
  console.log('Click ES68:', clickEs68?.result?.result?.value);

  ws.close();
  process.exit(0);
})();
