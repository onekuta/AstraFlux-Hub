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

    // Navigate to trigger tab -> switch subtab with AE64-MAX profile
    await send('Runtime.evaluate', {
      expression: `(() => {
        const url = location.href.split('?')[0] + '?view=device&tab=trigger&subtab=switch&profile=ae64';
        location.href = url;
      })()`
    });

    await sleep(2500);

    // Make sure '轴体设置' subtab is active
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const swBtn = btns.find(b => b.innerText && b.innerText.includes('轴体设置'));
        if (swBtn) swBtn.click();
      })()`
    });

    await sleep(800);

    // Inspect the text of badges on 1u keys
    const inspection = await send('Runtime.evaluate', {
      expression: `(() => {
        const testKeys = ['KeyA', 'KeyS', 'KeyD', 'KeyW', 'KeyQ', 'KeyE', 'Digit1', 'Digit2', 'Escape'];
        const results = [];
        testKeys.forEach(id => {
          const btn = document.querySelector('button[data-key-id="' + id + '"]');
          if (btn) {
            const topDiv = btn.children[0];
            const badgeSpan = topDiv ? topDiv.querySelector('span') : null;
            const text = badgeSpan ? badgeSpan.innerText.trim() : null;
            results.push({
              keyId: id,
              badgeText: text,
              hasEllipsis: text ? (text.includes('…') || text.includes('...')) : false,
              fontSize: badgeSpan ? window.getComputedStyle(badgeSpan).fontSize : null
            });
          }
        });
        return results;
      })()`,
      returnByValue: true
    });

    console.log('1u Keys Badge Inspection:', JSON.stringify(inspection.result?.result?.value || inspection.result, null, 2));

    // Capture screenshot in light mode (matching user's screenshot layout)
    const shotLight = await send('Page.captureScreenshot', { format: 'png' });
    const outLight = path.join(artifactDir, 'verify_switch_names_light.png');
    fs.writeFileSync(outLight, Buffer.from(shotLight.result.data, 'base64'));
    console.log('Saved screenshot to:', outLight);

    // Switch to dark mode and capture screenshot as well
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      })()`
    });
    await sleep(500);

    const shotDark = await send('Page.captureScreenshot', { format: 'png' });
    const outDark = path.join(artifactDir, 'verify_switch_names_dark.png');
    fs.writeFileSync(outDark, Buffer.from(shotDark.result.data, 'base64'));
    console.log('Saved screenshot to:', outDark);

    ws.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
})();
