const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const exePath = 'D:\\\\desk\\\\星闪悦动驱动\\\\软件本体\\\\星闪悦动HUB.exe';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function connectCDP() {
  let targets = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9333/json');
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch (e) {}
    await sleep(500);
  }
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const cb = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) cb.reject(msg.error);
      else cb.resolve(msg.result);
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    callbacks.set(curId, { resolve, reject });
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  return { ws, send };
}

async function run() {
  const { ws, send } = await connectCDP();

  // 1. 测试改键配置页面
  console.log('正在切换到【改键配置】页面...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '改键配置');
      if (btn) btn.click();
    })()`
  });
  await sleep(1500);

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_real_keybinds_tab.png'), Buffer.from(shot.data, 'base64'));
  console.log('已保存改键配置截图');

  // 2. 测试打开校准弹窗
  console.log('正在打开校准弹窗...');
  const calClick = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const calBtn = btns.find(b => b.innerText && (b.innerText.includes('全键消磁校准') || b.innerText.includes('校准')));
      if (calBtn) {
        calBtn.click();
        return { clicked: true, text: calBtn.innerText };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('校准按钮点击:', calClick.result.value);
  await sleep(1500);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_real_calibration_modal.png'), Buffer.from(shot.data, 'base64'));
  console.log('已保存校准弹窗截图');

  ws.close();
  process.exit(0);
}

run().catch(console.error);
