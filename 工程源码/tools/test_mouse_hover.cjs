const fs = require('fs');
const http = require('http');
const path = require('path');

const base = 'http://127.0.0.1:9333';
const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

function get(p) {
  return new Promise((res, rej) => {
    http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej);
  });
}

(async () => {
  const list = JSON.parse(await get(base + '/json'));
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = {};
  const send = (method, params = {}) =>
    new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) pending[m.id](m); };
  await new Promise((r) => { ws.onopen = r; });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 1500));

  // 确保处于驱动详情页面
  await send('Runtime.evaluate', {
    expression: `(() => {
      const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('进入驱动'));
      if (enterBtn) enterBtn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 1000));

  // 确保处于触发设置页面
  await send('Runtime.evaluate', {
    expression: `(() => {
      const triggerTab = document.querySelector('button[data-tab="trigger"]');
      if (triggerTab) triggerTab.click();
      const subTrigger = document.querySelector('button[data-subtab="trigger"]');
      if (subTrigger) subTrigger.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));

  // 获取按键 D 的绝对坐标
  const posRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const dKey = document.querySelector('button[data-key-id="KeyD"]');
      if (!dKey) return null;
      const r = dKey.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`,
    returnByValue: true
  });
  const pos = posRes?.result?.result?.value || posRes?.result?.value;
  console.log('posRes raw:', JSON.stringify(posRes));
  console.log('Key D Pos:', pos);

  if (pos) {
    const { x, y } = pos;
    // 使用 CDP 原生鼠标事件将鼠标移动到 D 键上方
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y,
    });
    await new Promise((r) => setTimeout(r, 800));

    // 检查是否有 tooltip 出现在 DOM 中
    const tooltipCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const tooltips = Array.from(document.querySelectorAll('div')).filter(d => d.textContent && d.textContent.includes('按键 D'));
        return tooltips.length;
      })()`,
      returnByValue: true
    });
    console.log('Tooltip count in DOM:', tooltipCheck?.result?.result?.value);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_tooltip_real_mouse.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Captured verify_tooltip_real_mouse.png');
  }

  // 2. 测试在死区页面 hover
  await send('Runtime.evaluate', {
    expression: `(() => {
      const subDeadzone = document.querySelector('button[data-subtab="deadzone"]');
      if (subDeadzone) subDeadzone.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));
  if (pos) {
    const { x, y } = pos;
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y,
    });
    await new Promise((r) => setTimeout(r, 800));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_tooltip_deadzone_real.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Captured verify_tooltip_deadzone_real.png');
  }

  // 3. 测试在轴体页面 hover
  await send('Runtime.evaluate', {
    expression: `(() => {
      const subSwitch = document.querySelector('button[data-subtab="switch"]');
      if (subSwitch) subSwitch.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));
  if (pos) {
    const { x, y } = pos;
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y,
    });
    await new Promise((r) => setTimeout(r, 800));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_tooltip_switch_real.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Captured verify_tooltip_switch_real.png');
  }

  ws.close();
  process.exit(0);
})();
