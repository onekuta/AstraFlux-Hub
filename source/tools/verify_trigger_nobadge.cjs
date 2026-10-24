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

  console.log('3. 进入触发设置...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=trigger&profile=ae64';
      location.href = url;
    })()`
  });
  await sleep(2500);

  // 截图触发设置键盘区域 (确认 A/S/D/B 键帽内部没有 SOCD/DKS/MPT 等徽标，只有清晰的 ▲0.40)
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_trigger_nobadge_clean.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_trigger_nobadge_clean.png');

  // 鼠标悬停在 A 键上以激活悬浮信息窗
  console.log('4. 悬停 A 键触发悬浮窗...');
  const keyPos = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('button[data-key-id="KeyA"]');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
      return null;
    })()`,
    returnByValue: true
  });

  if (keyPos && keyPos.result.value) {
    const { x, y } = keyPos.result.value;
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y
    });
    await sleep(1000);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verify_trigger_tooltip_with_advanced.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved verify_trigger_tooltip_with_advanced.png');
  }

  // 5. 切换到高级按键页面，确认高级页面按键内依然完整显示微标
  console.log('5. 进入高级按键页面...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=advanced&profile=ae64';
      location.href = url;
    })()`
  });
  await sleep(2000);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_advanced_tab_has_badges.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_advanced_tab_has_badges.png');

  process.exit(0);
})();
