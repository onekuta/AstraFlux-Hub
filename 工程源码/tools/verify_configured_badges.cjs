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
  const appProc = spawn(exePath, ['--remote-debugging-port=9333'], { stdio: 'ignore' });
  appProc.unref();
  await sleep(1500);

  const { ws, send } = await connectCDP();

  await send('Page.enable');
  await send('Runtime.enable');

  // Inject SOCD and DKS into localStorage
  await send('Runtime.evaluate', {
    expression: `(() => {
      const advancedData = [
        { id: 'item_1', type: 'SOCD', keys: ['A', 'D'], name: '对冲覆盖 (A / D)' },
        { id: 'item_2', type: 'DKS', keys: ['S'], name: '动态键程 (S)' },
        { id: 'item_3', type: 'MPT', keys: ['B'], name: '多段触发 (B)' },
      ];
      localStorage.setItem('sparklink_configured_higher_keys_ae64', JSON.stringify(advancedData));
      localStorage.setItem('sparklink_socd_keys_ae64', JSON.stringify({ keyA: 'KeyA', keyB: 'KeyD', mode: 0, delay: 0 }));
    })()`
  });

  // Reload page to apply
  await send('Page.reload');
  await sleep(2500);

  // 1. Check trigger tab
  console.log('1. 验证触发页面按键内部没有高级微标...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=trigger&profile=ae64';
      location.href = url;
    })()`
  });
  await sleep(2000);

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_trigger_nobadge_with_config.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_trigger_nobadge_with_config.png');

  // 2. Hover over key A to show tooltip with advanced info
  console.log('2. 悬停 A 键以激活悬浮窗...');
  const keyAPos = await send('Runtime.evaluate', {
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

  if (keyAPos && keyAPos.result.value) {
    const { x, y } = keyAPos.result.value;
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await sleep(800);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verify_trigger_tooltip_showing_socd.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved verify_trigger_tooltip_showing_socd.png');
  }

  // 3. Check advanced tab: keys A, S, D, B have badges!
  console.log('3. 进入高级页面验证按键徽标...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=advanced&profile=ae64';
      location.href = url;
    })()`
  });
  await sleep(2000);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_advanced_tab_showing_badges.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_advanced_tab_showing_badges.png');

  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
