const http = require('http');

http.get('http://127.0.0.1:9333/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    try {
      const list = JSON.parse(data);
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
        const evaluate = async (expr) => {
          const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
          return res?.result?.value;
        };

        const testResult = await evaluate(`(() => {
          // 查找当前 window 上的 Vue / React / 服务实例
          // 通过触发点击涂色一个按键
          const keyEsc = document.querySelector('[data-key="Esc"]') || Array.from(document.querySelectorAll('div, button')).find(el => el.textContent.includes('Esc'));
          if (keyEsc) {
            keyEsc.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            keyEsc.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
          return { keyFound: !!keyEsc };
        })()`);
        console.log('Test result:', testResult);
        process.exit(0);
      });
    } catch(e) {
      console.error(e);
      process.exit(1);
    }
  });
});
