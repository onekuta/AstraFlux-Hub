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
  try {
    const appProc = spawn(exePath, ['--remote-debugging-port=9333'], { stdio: 'ignore' });
    appProc.unref();
    await sleep(2000);

    const { ws, send } = await connectCDP();

    await send('Page.enable');
    await send('Runtime.enable');

    // 1. Navigate to advanced tab
    await send('Runtime.evaluate', {
      expression: `(() => {
        const url = location.href.split('?')[0] + '?view=device&tab=advanced&profile=ae64';
        location.href = url;
      })()`
    });

    await sleep(2500);

    // 2. Click on the SOCD card in overview mode to enter SOCD editor
    await send('Runtime.evaluate', {
      expression: `(() => {
        const socdBtn = document.querySelector('button[data-mode-id="SOCD"]');
        if (socdBtn) socdBtn.click();
      })()`
    });

    await sleep(1000);

    // 3. Inspect editor layout
    const inspection = await send('Runtime.evaluate', {
      expression: `(() => {
        const returnButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.includes('返回列表'));
        const confirmButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.trim() === '确定');
        const deleteButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.includes('删除'));
        
        const options = Array.from(document.querySelectorAll('*')).filter(el => {
          const t = el.innerText ? el.innerText.trim() : '';
          return t === '最后输入优先级' || t.startsWith('绝对优先级') || t === '相抵消';
        });

        const cancelCondition = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === '相抵消');
        const cancelRect = cancelCondition ? cancelCondition.getBoundingClientRect() : null;

        return {
          returnButtonsCount: returnButtons.length,
          confirmButtonsCount: confirmButtons.length,
          deleteButtonsCount: deleteButtons.length,
          optionsFound: options.map(o => o.innerText.trim()),
          cancelRect
        };
      })()`,
      returnByValue: true
    });

    console.log('Inspection:', JSON.stringify(inspection.result?.result?.value || inspection.result, null, 2));

    // Capture screenshot in light mode
    const shotLight = await send('Page.captureScreenshot', { format: 'png' });
    const outLight = path.join(artifactDir, 'verify_socd_no_overlap_light.png');
    fs.writeFileSync(outLight, Buffer.from(shotLight.result.data, 'base64'));
    console.log('Saved screenshot to:', outLight);

    // Switch to dark mode
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      })()`
    });
    await sleep(500);

    const shotDark = await send('Page.captureScreenshot', { format: 'png' });
    const outDark = path.join(artifactDir, 'verify_socd_no_overlap_dark.png');
    fs.writeFileSync(outDark, Buffer.from(shotDark.result.data, 'base64'));
    console.log('Saved screenshot to:', outDark);

    ws.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
})();
