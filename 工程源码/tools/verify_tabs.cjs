const http = require('http');
const fs = require('fs');
const path = require('path');

http.get('http://127.0.0.1:9333/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', async () => {
    const list = JSON.parse(data);
    const page = list[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);

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
      console.log('CDP connected.');

      const evaluate = async (expr) => {
        const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
        return res?.result?.value;
      };

      const capture = async (name) => {
        const res = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join('C:\\Users\\Lynan\\.gemini\\antigravity\\brain\\31aaf3cf-ac99-4434-84bd-f0b85977629a', name);
        fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
        console.log('Saved screenshot:', filePath);
      };

      const switchTab = async (tabId) => {
        await evaluate(`
          const btn = document.querySelector('button[data-tab="${tabId}"]');
          if (btn) btn.click();
        `);
        await new Promise(r => setTimeout(r, 800));
      };

      // 1. 触发设置页 (默认AP+RT)
      console.log('Switching to trigger tab...');
      await switchTab('trigger');
      await evaluate(`
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent.trim() === '触发设置');
        if (b) b.click();
      `);
      await new Promise(r => setTimeout(r, 600));
      await capture('verify_trigger_tab.png');

      // 2. 死区设置子页
      console.log('Switching to deadzone subtab...');
      await evaluate(`
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent.trim() === '死区设置');
        if (b) b.click();
      `);
      await new Promise(r => setTimeout(r, 600));
      await capture('verify_deadzone_tab.png');

      // 3. 轴体设置子页
      console.log('Switching to switch subtab...');
      await evaluate(`
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent.trim() === '轴体设置');
        if (b) b.click();
      `);
      await new Promise(r => setTimeout(r, 600));
      await capture('verify_switch_tab.png');

      // 4. 改键配置页
      console.log('Switching to keybinds tab...');
      await switchTab('keybinds');
      await capture('verify_keybinds_tab.png');

      // 5. 灯光配置页
      console.log('Switching to lighting tab...');
      await switchTab('lighting');
      await capture('verify_lighting_tab.png');

      // 6. 性能设置页
      console.log('Switching to performance tab...');
      await switchTab('performance');
      await capture('verify_performance_tab.png');

      // 7. 高级键页面
      console.log('Switching to advanced tab...');
      await switchTab('advanced');
      await capture('verify_advanced_tab.png');

      console.log('All verification screenshots captured successfully!');
      ws.close();
      process.exit(0);
    });
  });
});
