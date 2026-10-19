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
  ws.onopen = () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          return Array.from(document.querySelectorAll('button')).map((b, idx) => ({
            idx,
            text: (b.innerText || b.textContent || '').trim().replace(/\\s+/g, ' '),
            rect: b.getBoundingClientRect()
          }));
        })()`,
        returnByValue: true
      }
    }));
  };
  ws.onmessage = (msg) => {
    const res = JSON.parse(msg.data);
    console.log('BUTTONS:', JSON.stringify(res.result.result.value, null, 2));
    ws.close();
    process.exit(0);
  };
})();
