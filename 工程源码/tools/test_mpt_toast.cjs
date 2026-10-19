const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

(async () => {
  const exePath = 'D:\\desk\\星闪悦动驱动\\软件本体\\星闪悦动HUB.exe';
  const appProc = spawn(exePath, ['--remote-debugging-port=9343'], { stdio: 'ignore' });
  appProc.unref();
  await new Promise(r => setTimeout(r, 2000));

  const res = await fetch('http://127.0.0.1:9343/json');
  const targets = await res.json();
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

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Runtime.evaluate', {
    expression: `(() => {
      location.href = location.href.split('?')[0] + '?view=device&tab=advanced&profile=ae64&theme=light';
    })()`
  });
  await new Promise(r => setTimeout(r, 2200));

  // Open MPT editor
  await send('Runtime.evaluate', {
    expression: `(() => {
      const leftMpt = document.querySelector('button[data-mode-id="MPT"]');
      if (leftMpt) leftMpt.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // Assign key D to MPT bind key and set stage 3 value to 0.8 mm (less than stage 2 1.0mm)
  await send('Runtime.evaluate', {
    expression: `(() => {
      // Click bind slot and then click D from keyboard
      const bindSlot = document.querySelector('[data-slot-id="mpt_bind"]');
      if (bindSlot) bindSlot.click();
      const keyD = Array.from(document.querySelectorAll('button, div')).find(el => el.textContent && el.textContent.trim() === 'D');
      if (keyD) keyD.click();

      // Adjust stage 3 range
      const ranges = document.querySelectorAll('input[type="range"]');
      if (ranges.length >= 3) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(ranges[2], 0.8);
        ranges[2].dispatchEvent(new Event('input', { bubbles: true }));
        ranges[2].dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Click 确定 button to trigger warning toast: 三个深度值必须递增，每个值必须比前一个值大
  await send('Runtime.evaluate', {
    expression: `(() => {
      const okBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('确定'));
      if (okBtn) okBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  const shotMptInvalid = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_mpt_increasing_toast.png'), Buffer.from(shotMptInvalid.result.data, 'base64'));
  console.log('Saved verify_mpt_increasing_toast.png');

  await send('Browser.close').catch(() => {});
  try { process.kill(appProc.pid); } catch(e) {}
  process.exit(0);
})();
