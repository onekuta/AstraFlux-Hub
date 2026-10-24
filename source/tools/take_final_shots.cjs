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

  // 1. 改键配置页面
  console.log('2. 导航至【改键配置】页面...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      location.href = location.href.split('?')[0] + '?view=device&tab=keybinds&profile=ae64';
    })()`
  });
  await sleep(2000);

  const keybindsInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.shrink-0.h-\\\\[276px\\\\]');
      const spaceKey = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.trim() === 'Space');
      const r = card ? card.getBoundingClientRect() : null;
      const sr = spaceKey ? spaceKey.getBoundingClientRect() : null;
      return {
        cardWidth: r ? Math.round(r.width) : null,
        cardHeight: r ? Math.round(r.height) : null,
        spaceBottom: sr ? Math.round(sr.bottom) : null,
        windowHeight: window.innerHeight,
        isSpaceFullyVisible: sr ? sr.bottom <= window.innerHeight : false
      };
    })()`,
    returnByValue: true
  });
  console.log('改键页面测量:', keybindsInfo.result.value);

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'final_keybinds_full_104.png'), Buffer.from(shot.data, 'base64'));

  // 2. 触发配置页面
  console.log('3. 导航至【触发配置】页面...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      location.href = location.href.split('?')[0] + '?view=device&tab=trigger&profile=ae64';
    })()`
  });
  await sleep(1500);

  const triggerInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.shrink-0.h-\\\\[276px\\\\]');
      const r = card ? card.getBoundingClientRect() : null;
      return {
        cardWidth: r ? Math.round(r.width) : null,
        cardHeight: r ? Math.round(r.height) : null
      };
    })()`,
    returnByValue: true
  });
  console.log('触发页面测量:', triggerInfo.result.value);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'final_trigger_tab.png'), Buffer.from(shot.data, 'base64'));

  // 3. 死区设置页面
  console.log('4. 导航至【死区设置】页面...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      location.href = location.href.split('?')[0] + '?view=device&tab=deadzone&profile=ae64';
    })()`
  });
  await sleep(1500);

  const deadzoneInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.shrink-0.h-\\\\[276px\\\\]');
      const r = card ? card.getBoundingClientRect() : null;
      return {
        cardWidth: r ? Math.round(r.width) : null,
        cardHeight: r ? Math.round(r.height) : null
      };
    })()`,
    returnByValue: true
  });
  console.log('死区页面测量:', deadzoneInfo.result.value);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'final_deadzone_tab.png'), Buffer.from(shot.data, 'base64'));

  // 4. 轴体校准弹窗 (0mm 零位，混轴行程)
  console.log('5. 导航至【轴体全键校准】弹窗...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      location.href = location.href.split('?')[0] + '?view=device&tab=trigger&profile=ae64&modal=calibration';
    })()`
  });
  await sleep(2000);

  const calInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.fixed.inset-0');
      // 提取波形区域 Y 轴文字与当前深度文字
      const depthNumber = Array.from(document.querySelectorAll('*')).find(el => el.children.length === 0 && /^0\\.00$/.test(el.innerText?.trim()));
      const axisBadge = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.includes('当前轴体:'));
      const leftArrowKey = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '←');

      return {
        isModalOpen: !!modal,
        hasZeroMmTravel: !!depthNumber,
        axisBadgeText: axisBadge ? axisBadge.innerText.trim() : null,
        leftArrowFound: !!leftArrowKey
      };
    })()`,
    returnByValue: true
  });
  console.log('校准弹窗状态测量:', calInfo.result.value);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'final_calibration_modal.png'), Buffer.from(shot.data, 'base64'));

  ws.close();
  try {
    process.kill(appProc.pid);
  } catch (e) {}

  console.log('✅ 全部最终验证截图已生成！');
  process.exit(0);
}

run().catch(console.error);
