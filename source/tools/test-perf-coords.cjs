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
      if (!ks.connected) {
        await ks.autoConnect();
      }
      
      const perfA = await ks.getPerformance(3, 1);
      const perfZ = await ks.getPerformance(4, 1);
      const perfW = await ks.getPerformance(2, 2);
      
      return {
        isConn: ks.connected,
        perfA,
        perfZ,
        perfW
      };
    })()`);

    console.log('PERF_CHECK:', JSON.stringify(res, null, 2));

    ws.close();
    process.exit(0);
  });
});
