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

      // Click enter driver if on home page
      await send('Runtime.evaluate', {
        expression: `
          const enterBtn = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('进入驱动') || x.textContent.includes('立即连接'));
          if (enterBtn) enterBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 1000));

      // Click trigger tab first
      await send('Runtime.evaluate', {
        expression: `document.querySelector('button[data-tab="trigger"]').click()`,
      });
      await new Promise(r => setTimeout(r, 500));

      // Click deadzone subtab
      await send('Runtime.evaluate', {
        expression: `document.querySelector('button[data-subtab="deadzone"]').click()`,
      });
      await new Promise(r => setTimeout(r, 600));
      await capture('verify_deadzone_real.png');

      // Click switch subtab
      await send('Runtime.evaluate', {
        expression: `document.querySelector('button[data-subtab="switch"]').click()`,
      });
      await new Promise(r => setTimeout(r, 600));
      await capture('verify_switch_real.png');

      ws.close();
      process.exit(0);
    });
  });
});
