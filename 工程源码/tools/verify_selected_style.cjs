const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Lynan\\.gemini\\antigravity\\brain\\31aaf3cf-ac99-4434-84bd-f0b85977629a';

function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9333/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(t => t.type === 'page' || t.url?.includes('index.html')) || list[0];
          if (!page || !page.webSocketDebuggerUrl) {
            reject(new Error('未找到调试页面'));
          } else {
            resolve(page.webSocketDebuggerUrl);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const wsUrl = await getWsUrl();
  console.log('连接 CDP:', wsUrl);
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = idCounter++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

  console.log('[1/3] 刷新并进入触发配置主页面...');
  await send('Page.enable');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2200));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('进入驱动'));
        if (enterBtn) enterBtn.click();
        
        const triggerTab = document.querySelector('button[data-tab="trigger"]');
        if (triggerTab) triggerTab.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('[2/3] 点击选中 J, ;, \', / 按键...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const keys = Array.from(document.querySelectorAll('.app-content button')).filter(b => {
          const t = b.textContent;
          return t.includes('J') || t.includes(';') || t.includes("'") || t.includes('/');
        });
        keys.forEach(k => k.click());
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('[3/3] 截取按键选中后的全景效果...');
  const snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_selected_key_style.png'), Buffer.from(snap.data, 'base64'));
  console.log('已保存 verify_selected_key_style.png');

  ws.close();
  console.log('验证完成！');
}

run().catch(e => {
  console.error('CDP 错误:', e);
  process.exit(1);
});
