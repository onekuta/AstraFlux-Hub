const http = require('http');

http.get('http://127.0.0.1:9333/json', async (r) => {
  let d = ''; r.on('data', c => d += c);
  r.on('end', async () => {
    const list = JSON.parse(d);
    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(res => ws.onopen = res);
    let id = 0;
    const send = (m, p = {}) => new Promise((res) => {
      const i = ++id;
      const handler = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === i) { ws.removeEventListener('message', handler); res(msg.result); }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: i, method: m, params: p }));
    });
    await send('Runtime.enable');

    const evalJs = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return res.result ? res.result.value : null;
    };

    const diag = await evalJs(`(async () => {
      // 找到 React container 里的 state 或者挂在 window 上的服务
      let ks = window.ks;
      if (!ks) {
        // 从 webpack/vite 或 DOM 查找
        const rEl = document.querySelector('#root');
        // 尝试用 input/button 触发或者从全局抓
      }
      return {
        url: location.href,
        title: document.title,
        bodyText: document.body.innerText.slice(0, 300)
      };
    })()`);

    console.log('DIAG_RESULT:', JSON.stringify(diag, null, 2));
    ws.close();
    process.exit(0);
  });
});
