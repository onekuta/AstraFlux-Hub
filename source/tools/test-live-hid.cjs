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
      if (res.exceptionDetails) {
        return { error: res.exceptionDetails.text, desc: res.exceptionDetails.exception?.description };
      }
      return res.result ? res.result.value : null;
    };

    // 等待 2 秒让页面准备好
    await new Promise(r => setTimeout(r, 2000));

    const check = await evalJs(`(async () => {
      const devices = await navigator.hid.getDevices();
      return devices.map(d => ({
        name: d.productName,
        vid: d.vendorId,
        pid: d.productId,
        opened: d.opened,
        collections: d.collections ? d.collections.length : 0
      }));
    })()`);

    console.log('HID_DEVICES:', JSON.stringify(check, null, 2));

    ws.close();
    process.exit(0);
  });
});
