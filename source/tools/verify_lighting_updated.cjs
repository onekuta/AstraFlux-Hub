const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const exePath = 'D:\\desk\\星闪悦动驱动\\软件本体\\星闪悦动HUB.exe';

function sleep(ms) {
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
  if (!targets) throw new Error('Cannot connect to CDP at 9333');

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

  return { ws, send };
}

(async () => {
  console.log('1. 启动应用...');
  const appProc = spawn(exePath, ['--remote-debugging-port=9333'], { stdio: 'ignore' });
  appProc.unref();

  await sleep(2000);
  console.log('2. 连接 CDP...');
  const { ws, send } = await connectCDP();

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('3. 进入灯光设置...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=lighting&profile=ae64';
      location.href = url;
    })()`
  });
  await sleep(2500);

  // 截取主键盘灯效面板全貌
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_lighting_main_modes.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_lighting_main_modes.png');

  // 点击【装饰灯1】
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const stripBtn = btns.find(b => (b.innerText || '').trim() === '装饰灯1');
      if (stripBtn) stripBtn.click();
    })()`
  });
  await sleep(1500);

  // 截取装饰灯1灯效面板
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_lighting_strip1_modes.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_lighting_strip1_modes.png');

  // 切回主键盘并测试点击 L17 (水波涟漪) 与 L18 (激光横扫)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const kbBtn = btns.find(b => (b.innerText || '').trim() === '主键盘');
      if (kbBtn) kbBtn.click();
    })()`
  });
  await sleep(800);

  // 点击 L17
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const l17Btn = btns.find(b => (b.innerText || '').includes('L17'));
      if (l17Btn) l17Btn.click();
    })()`
  });
  await sleep(1000);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_lighting_l17_active.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_lighting_l17_active.png');

  console.log('完成全部截图验证！');
  process.exit(0);
})();
