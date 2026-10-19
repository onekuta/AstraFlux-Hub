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

  console.log('[1/4] 刷新页面并确保进入触发设置主页...');
  await send('Page.enable');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2200));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        // 若在首页则点击进入驱动
        const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('进入驱动'));
        if (enterBtn) enterBtn.click();
        
        // 确保在触发设置子页
        const triggerSub = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '触发设置');
        if (triggerSub) triggerSub.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('[2/4] 截取高级设置页面 (完全对齐图二)...');
  const snap1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_advanced_settings.png'), Buffer.from(snap1.data, 'base64'));
  console.log('已保存 verify_advanced_settings.png');

  console.log('[3/4] 点击「死区设置 ⚙ 设置」进行跳转...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        // 精准点击右侧高级设置卡片内的「设置」按钮
        const settingsBtn = document.querySelector('.operation-columns .col:last-child button:has(svg)');
        if (settingsBtn) {
          settingsBtn.click();
          return 'clicked_settings_btn';
        }
        return 'not_found';
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('[4/4] 截取跳转后的专属死区设置界面...');
  const snap2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_deadzone_jump.png'), Buffer.from(snap2.data, 'base64'));
  console.log('已保存 verify_deadzone_jump.png');

  ws.close();
  console.log('验证全部完成！');
}

run().catch(e => {
  console.error('CDP 验证错误:', e);
  process.exit(1);
});
