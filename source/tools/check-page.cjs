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
    await send('Page.enable');
    await send('Log.enable');

    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.log('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception);
      }
    });

    const base = page.url.split('?')[0];
    const targetUrl = base + '?view=device&tab=trigger&profile=' + (process.argv[2] || 'ae64_max');
    console.log('Navigating to:', targetUrl);
    await send('Page.navigate', { url: targetUrl });
    await new Promise(r => setTimeout(r, 4500));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        return {
          url: location.href,
          title: document.title,
          h3s: [...document.querySelectorAll('h3')].map(h => h.innerText.trim()),
          cols: document.querySelectorAll('.col').length,
          continuousText: [...document.querySelectorAll('*')].filter(el => el.children.length === 0 && el.innerText && el.innerText.includes('连续快速触发')).map(el => el.innerText),
        };
      })()`,
      returnByValue: true
    });
    console.log('Result:', JSON.stringify(res.result.value, null, 2));
    ws.close();
    process.exit(0);
  });
});
