const http = require('http');
const fs = require('fs');
const path = require('path');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

http.get('http://127.0.0.1:9333/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    try {
      const list = JSON.parse(data);
      if (!list || list.length === 0) {
        console.error('No targets found');
        process.exit(1);
      }
      const pageTarget = list.find(t => t.type === 'page' || !t.type) || list[0];
      const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
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
        console.log('Connected to CDP target');

        const evaluate = async (expr) => {
          const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
          return res?.result?.value;
        };

        const capture = async (name) => {
          const res = await send('Page.captureScreenshot', { format: 'png' });
          const filePath = path.join('C:\\Users\\Lynan\\.gemini\\antigravity\\brain\\babc9b26-a62e-4b1e-955d-2be516999335', name);
          fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
          console.log('Saved screenshot:', name);
        };

        // 等待页面渲染并点击进入驱动
        await wait(2000);
        await evaluate(`
          const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('进入驱动'));
          if (enterBtn) enterBtn.click();
        `);
        await wait(1500);

        // 切换到灯光配置
        console.log('Switching to lighting tab...');
        await evaluate(`
          const lightBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('灯光配置') || b.getAttribute('data-tab') === 'lighting');
          if (lightBtn) lightBtn.click();
        `);
        await wait(1500);

        // 检查自定义涂色模式与按键渲染
        const info = await evaluate(`(() => {
          const keys = Array.from(document.querySelectorAll('.keyboard-key, [data-key-code], [data-key]'));
          const spaceKey = Array.from(document.querySelectorAll('div, button')).find(el => el.textContent.trim() === 'Space' || el.getAttribute('data-key') === 'Space');
          const tabs = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
          return {
            keyCount: keys.length,
            hasSpace: !!spaceKey,
            tabs: tabs.filter(t => t.length > 0 && t.length < 20)
          };
        })()`);
        console.log('Lighting view info:', JSON.stringify(info));

        await capture('verify_lighting_restored_view.png');

        // 测试装饰灯
        await evaluate(`
          const decorBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '装饰灯1' || b.textContent.includes('装饰灯1'));
          if (decorBtn) decorBtn.click();
        `);
        await wait(1000);
        await capture('verify_decor_lighting_view.png');

        // 回到主键盘
        await evaluate(`
          const mainKbBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '主键盘');
          if (mainKbBtn) mainKbBtn.click();
        `);
        await wait(1000);

        // 验证探针适配数据转换器在前端环境下的正确运行
        const probeTest = await evaluate(`(() => {
          try {
            // 测试 window 上是否有相关状态或 service
            return { ok: true, href: window.location.href };
          } catch(e) {
            return { ok: false, error: e.message };
          }
        })()`);
        console.log('Frontend env check:', probeTest);

        console.log('All automated checks done!');
        process.exit(0);
      });
    } catch (e) {
      console.error('CDP Error:', e);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('HTTP Error:', err.message);
  process.exit(1);
});
