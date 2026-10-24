const http = require('http');
const fs = require('fs');
const path = require('path');

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
      const capture = async (name) => {
        const res = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join('C:\\Users\\Lynan\\.gemini\\antigravity\\brain\\31aaf3cf-ac99-4434-84bd-f0b85977629a', name);
        fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
        console.log('Saved:', name);
      };

      const clickTab = async (tabName) => {
        await send('Runtime.evaluate', {
          expression: `document.querySelector('button[data-tab="${tabName}"]').click()`,
        });
        await new Promise(r => setTimeout(r, 800));
      };

      // Performance tab screenshot
      await clickTab('performance');
      await capture('verify_performance_real.png');

      // Keybinds tab screenshot
      await clickTab('keybinds');
      await capture('verify_keybinds_real.png');

      // Lighting tab screenshot
      await clickTab('lighting');
      await capture('verify_lighting_real.png');

      // Advanced tab screenshot
      await clickTab('advanced');
      await capture('verify_advanced_real.png');

      // Trigger tab screenshot
      await clickTab('trigger');
      await capture('verify_trigger_real.png');

      ws.close();
      process.exit(0);
    });
  });
});
