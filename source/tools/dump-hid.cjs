// 真机 HID 枚举探针（无截图，仅回显数据）
// 用法: node tools/dump-hid.cjs [cdpBaseUrl]
const http = require('http');

const base = process.argv[2] || 'http://127.0.0.1:9333';

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

  const out = await evalJs(`(async () => {
    if (!navigator.hid) return 'NO_HID_API';
    const devs = await navigator.hid.getDevices();
    return JSON.stringify({
      count: devs.length,
      list: devs.map(d => ({
        name: d.productName || '(空)',
        vid: '0x' + d.vendorId.toString(16).toUpperCase(),
        pid: '0x' + d.productId.toString(16).toUpperCase(),
        vidDec: d.vendorId,
        pidDec: d.productId,
        key: d.vendorId + ':' + d.productId,
        collections: (d.collections || []).length,
      })),
    }, null, 1);
  })()`);

  console.log('=== HID_DUMP_START ===');
  console.log(out);
  console.log('=== HID_DUMP_END ===');
  ws.close();
  process.exit(0);
})();
