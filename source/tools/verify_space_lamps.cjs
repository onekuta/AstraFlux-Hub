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
      console.log('Connected to CDP');

      const capture = async (name) => {
        const res = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join('C:\\Users\\Lynan\\.gemini\\antigravity\\brain\\31aaf3cf-ac99-4434-84bd-f0b85977629a', name);
        fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
        console.log('Saved:', name);
      };

      const evaluate = async (expr) => {
        const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
        return res?.result?.value;
      };

      // 1. Reload page
      await send('Page.reload');
      await new Promise(r => setTimeout(r, 1500));

      // 2. Click "进入驱动"
      await evaluate(`
        const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('进入驱动'));
        if (enterBtn) enterBtn.click();
      `);
      await new Promise(r => setTimeout(r, 1000));

      // 3. Click "灯光配置"
      await evaluate(`
        const lightBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('灯光配置') || b.getAttribute('data-tab') === 'lighting');
        if (lightBtn) lightBtn.click();
      `);
      await new Promise(r => setTimeout(r, 1000));

      // 4. Capture lighting tab with 5 lamps & compact panel
      await capture('verify_space_5lamps.png');

      // 5. Test clicking "彩虹渐变"
      await evaluate(`(() => {
        const rainbowBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('彩虹渐变'));
        if (rainbowBtn) rainbowBtn.click();
      })()`);
      await new Promise(r => setTimeout(r, 800));
      await capture('verify_space_rainbow.png');

      ws.close();
      process.exit(0);
    });
  });
});
