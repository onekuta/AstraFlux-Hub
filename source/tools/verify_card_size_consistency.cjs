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
  console.log('1. 启动驱动应用...');
  const appProc = spawn(exePath, ['--remote-debugging-port=9333'], { stdio: 'ignore' });
  appProc.unref();

  await sleep(1500);
  const { ws, send } = await connectCDP();

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });

  const cardSizes = {};

  // 1. 改键配置页面
  console.log('2. 测量【改键配置】页面...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      location.href = location.href.split('?')[0] + '?view=device&tab=keybinds&profile=ae64';
    })()`
  });
  await sleep(1500);

  const keybindsInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.shrink-0.h-\\\\[280px\\\\]');
      const spaceKey = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.trim() === 'Space');
      const r = card ? card.getBoundingClientRect() : null;
      const sr = spaceKey ? spaceKey.getBoundingClientRect() : null;
      return {
        cardWidth: r ? Math.round(r.width) : null,
        cardHeight: r ? Math.round(r.height) : null,
        spaceBottom: sr ? Math.round(sr.bottom) : null,
        isSpaceVisible: sr ? (sr.bottom <= window.innerHeight && sr.height > 10) : false
      };
    })()`,
    returnByValue: true
  });
  cardSizes['改键配置 (Keybinds)'] = keybindsInfo.result.value;

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_card_keybinds_280.png'), Buffer.from(shot.data, 'base64'));

  // 2. 触发配置页面
  console.log('3. 测量【触发配置】页面...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      location.href = location.href.split('?')[0] + '?view=device&tab=trigger&profile=ae64';
    })()`
  });
  await sleep(1500);

  const triggerInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.shrink-0.h-\\\\[280px\\\\]');
      const r = card ? card.getBoundingClientRect() : null;
      return {
        cardWidth: r ? Math.round(r.width) : null,
        cardHeight: r ? Math.round(r.height) : null
      };
    })()`,
    returnByValue: true
  });
  cardSizes['触发设置 (Trigger)'] = triggerInfo.result.value;

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_card_trigger_280.png'), Buffer.from(shot.data, 'base64'));

  // 3. 死区设置页面 (重点验证图 4/图 5 问题)
  console.log('4. 测量【死区设置】页面...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const deadzoneBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.trim() === '死区设置');
      if (deadzoneBtn) deadzoneBtn.click();
    })()`
  });
  await sleep(1000);

  const deadzoneInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.shrink-0.h-\\\\[280px\\\\]');
      const r = card ? card.getBoundingClientRect() : null;
      return {
        cardWidth: r ? Math.round(r.width) : null,
        cardHeight: r ? Math.round(r.height) : null
      };
    })()`,
    returnByValue: true
  });
  cardSizes['死区设置 (Deadzone)'] = deadzoneInfo.result.value;

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_card_deadzone_280.png'), Buffer.from(shot.data, 'base64'));

  // 4. 轴体设置页面
  console.log('5. 测量【轴体设置】页面...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const switchBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.trim() === '轴体设置');
      if (switchBtn) switchBtn.click();
    })()`
  });
  await sleep(1000);

  const switchInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.shrink-0.h-\\\\[280px\\\\]');
      const r = card ? card.getBoundingClientRect() : null;
      return {
        cardWidth: r ? Math.round(r.width) : null,
        cardHeight: r ? Math.round(r.height) : null
      };
    })()`,
    returnByValue: true
  });
  cardSizes['轴体设置 (Switches)'] = switchInfo.result.value;

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_card_switches_280.png'), Buffer.from(shot.data, 'base64'));

  console.log('\n================== 代表键盘大卡片尺寸一致性实测结果 ==================');
  console.table(cardSizes);

  ws.close();
  try {
    process.kill(appProc.pid);
  } catch (e) {}

  console.log('✅ 测试全部顺利完成！');
  process.exit(0);
}

run().catch(console.error);
