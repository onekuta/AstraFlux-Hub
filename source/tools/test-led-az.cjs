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
      
      // 测试下发真实自定义灯光
      // 创建 6 行 x 21 列
      const data = Array.from({ length: 6 }, () => 
        Array.from({ length: 21 }, () => ({ R: 0, G: 0, B: 0, isCustom: false }))
      );

      // KeyA: row 3, col 1 -> 纯蓝
      data[3][1] = { R: 0, G: 0, B: 255, isCustom: true };
      
      // KeyZ: row 4, col 2 -> 纯红
      data[4][2] = { R: 255, G: 0, B: 0, isCustom: true };

      const ok = await ks.sdk.setLightingCustom({
        area: 'Keyboard',
        protocol: 'Custom',
        data
      });

      return { ok };
    })()`);

    console.log('LED_TEST_RESULT:', JSON.stringify(res, null, 2));

    ws.close();
    process.exit(0);
  });
});
