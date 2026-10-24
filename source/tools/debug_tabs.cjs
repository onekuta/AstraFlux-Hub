const http = require('http');

http.get('http://127.0.0.1:9333/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const list = JSON.parse(data);
    const ws = new WebSocket(list[0].webSocketDebuggerUrl);
    let id = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      const handler = (evt) => {
        const parsed = JSON.parse(evt.data);
        if (parsed.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(parsed.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
    ws.addEventListener('open', async () => {
      // Test clicking 'performance' tab directly
      const clickRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = document.querySelector('button[data-tab="performance"]');
            if (!btn) return 'button not found';
            btn.click();
            return 'clicked: ' + btn.textContent.trim();
          })()
        `,
        returnByValue: true
      });
      console.log('Click performance result:', clickRes?.result?.value);

      await new Promise(r => setTimeout(r, 600));

      const activeRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const active = document.querySelector('.nav-item.active');
            return active ? active.textContent.trim() : 'no active nav';
          })()
        `,
        returnByValue: true
      });
      console.log('Active nav item:', activeRes?.result?.value);

      ws.close();
      process.exit(0);
    });
  });
});
