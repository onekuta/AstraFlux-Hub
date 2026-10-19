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
      const matrix = await ks.getKeyMatrix();
      
      // 测试逐行
      const rows = [];
      for (let r = 0; r < 7; r++) {
        const style = await ks.sdk.getKeyLayoutStyle({ row: r });
        rows.push({
          row: r,
          keys: style?.keyLayoutStyle?.filter(k => k.row !== 0 || k.col !== 0 || (k.ratio && k.ratio !== 0))
        });
      }

      // 测试 Z 键与 A 键的性能读取与矩阵坐标
      // 在 ES68 上，视觉布局有 68 键
      return {
        matrixLength: matrix?.length,
        matrixSample: matrix?.slice(0, 20),
        rows
      };
    })()`);

    console.log('MATRIX_STATUS:', JSON.stringify(res, null, 2));

    ws.close();
    process.exit(0);
  });
});
