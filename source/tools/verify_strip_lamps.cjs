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
      console.log('Reloading page...');
      await send('Page.reload');
      await new Promise(r => setTimeout(r, 1500));

      // 2. Click "进入驱动"
      console.log('Entering driver...');
      await evaluate(`
        const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('进入驱动'));
        if (enterBtn) enterBtn.click();
      `);
      await new Promise(r => setTimeout(r, 1000));

      // 3. Click "灯光配置" Tab
      console.log('Navigating to Lighting Tab...');
      await evaluate(`
        const lightBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('灯光配置') || b.getAttribute('data-tab') === 'lighting');
        if (lightBtn) lightBtn.click();
      `);
      await new Promise(r => setTimeout(r, 1000));

      // 4. Click "底灯 / 装饰灯带" capsule
      console.log('Switching to Strip / Decorate area...');
      await evaluate(`
        const stripBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('底灯 / 装饰灯带') || b.textContent.includes('装饰灯带 / 底灯'));
        if (stripBtn) stripBtn.click();
      `);
      await new Promise(r => setTimeout(r, 1200));

      // Capture strip default stage
      await capture('verify_strip_stage.png');

      // 5. Test clicking LED cards (paint LEDs #03, #07, #13, #20)
      console.log('Testing LED painting...');
      await evaluate(`(() => {
        const ledBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('LED') && /\\d{2}/.test(b.textContent));
        if (ledBtns[2]) ledBtns[2].click();
        if (ledBtns[6]) ledBtns[6].click();
        if (ledBtns[12]) ledBtns[12].click();
        if (ledBtns[19]) ledBtns[19].click();
      })()`);
      await new Promise(r => setTimeout(r, 800));

      // 6. Test clicking "顺时针旋转"
      console.log('Testing direction change to clockwise...');
      await evaluate(`(() => {
        const cwBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('顺时针旋转'));
        if (cwBtn) cwBtn.click();
      })()`);
      await new Promise(r => setTimeout(r, 800));

      await capture('verify_strip_interactive.png');

      ws.close();
      process.exit(0);
    });

    ws.addEventListener('error', (e) => {
      console.error('WS Error:', e);
      process.exit(1);
    });
  });
}).on('error', (e) => {
  console.error('HTTP Error:', e);
  process.exit(1);
});
