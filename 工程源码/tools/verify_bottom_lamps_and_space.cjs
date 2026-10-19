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
        const filePath = path.join('C:\\Users\\Lynan\\.gemini\\antigravity\\brain\\babc9b26-a62e-4b1e-955d-2be516999335', name);
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

      // 4. Capture Main Keyboard View: verify space multi-lamp box is removed from left panel, and top-right toggle exists
      console.log('Capturing main keyboard lighting view...');
      await capture('verify_space_box_removed.png');

      // 5. Test clicking "装饰灯1"
      console.log('Switching to 装饰灯1 area...');
      await evaluate(`
        const decorBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '装饰灯1' || b.textContent.includes('装饰灯1'));
        if (decorBtn) decorBtn.click();
      `);
      await new Promise(r => setTimeout(r, 1000));

      // 6. Capture Decorate 1 (Bottom lamps) view for AE64-MAX (should show 31 LEDs: 17 + 14)
      console.log('Capturing AE64-MAX 31 bottom lamps view...');
      await capture('verify_ae64_31_bottom_lamps.png');

      // 7. Toggle top-right space multi-lamp toggle
      console.log('Testing top-right spacebar toggle...');
      await evaluate(`
        const kbBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '主键盘');
        if (kbBtn) kbBtn.click();
      `);
      await new Promise(r => setTimeout(r, 600));

      await evaluate(`
        const spaceToggle = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('空格5灯独立') || b.textContent.includes('空格整体'));
        if (spaceToggle) spaceToggle.click();
      `);
      await new Promise(r => setTimeout(r, 600));
      await capture('verify_space_toggled_unified.png');

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
