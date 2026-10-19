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

    const details = await evalJs(`(async () => {
      const devices = await navigator.hid.getDevices();
      const es68s = devices.filter(d => d.vendorId === 7334 && d.productId === 7204);
      return es68s.map((d, idx) => ({
        idx,
        opened: d.opened,
        collections: (d.collections || []).map(c => ({
          usagePage: '0x' + c.usagePage.toString(16),
          usage: '0x' + c.usage.toString(16),
          inputReports: (c.inputReports || []).map(r => r.reportId),
          outputReports: (c.outputReports || []).map(r => r.reportId),
          featureReports: (c.featureReports || []).map(r => r.reportId)
        }))
      }));
    })()`);

    console.log('ES68_DETAILS:', JSON.stringify(details, null, 2));

    ws.close();
    process.exit(0);
  });
});
