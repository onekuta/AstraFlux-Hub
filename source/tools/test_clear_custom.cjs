const path = require('path');
const fs = require('fs');

async function testClearCustom() {
  const res = await fetch('http://127.0.0.1:9333/json');
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let curId = 0;
  const handlers = {};
  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    if (data.id && handlers[data.id]) {
      handlers[data.id](data);
      delete handlers[data.id];
    }
  };

  await new Promise(r => ws.onopen = r);

  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++curId;
    handlers[id] = resolve;
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  // Test 1: Click "清除自定义灯效"
  const clearResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const clearBtn = btns.find(b => (b.innerText || '').includes('清除自定义灯效'));
      if (clearBtn) {
        clearBtn.click();
        return 'clicked';
      }
      return 'not found';
    })()`,
    returnByValue: true
  });
  console.log('Clear button test:', clearResult.result.value);

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_clear_custom_result.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_clear_custom_result.png');
  process.exit(0);
}

testClearCustom().catch(e => {
  console.error(e);
  process.exit(1);
});
