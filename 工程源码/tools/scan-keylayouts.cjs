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

    const res = await evalJs(`(async () => {
      const ks = window.__keyboardService;
      if (!ks.connected) await ks.autoConnect();
      
      // 读取键码映射：官方 getKeyLayout layer=0
      const layouts = [];
      for (let r = 0; r < 6; r++) {
        try {
          const l = await ks.sdk.getKeyLayout({ layer: 0, row: r });
          layouts.push({ row: r, data: l?.keyboardLayout || [] });
        } catch(e) {
          layouts.push({ row: r, err: e.message });
        }
      }
      return layouts;
    })()`);

    console.log('REAL_KEY_LAYOUTS_FROM_HARDWARE:', JSON.stringify(res, null, 2));

    ws.close();
    process.exit(0);
  });
});
