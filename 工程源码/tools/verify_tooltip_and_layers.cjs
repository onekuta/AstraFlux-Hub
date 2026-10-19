const fs = require('fs');
const http = require('http');
const path = require('path');

const base = 'http://127.0.0.1:9333';
const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/31aaf3cf-ac99-4434-84bd-f0b85977629a';

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

  // 点击【进入驱动】按钮进入驱动页面
  await send('Runtime.evaluate', {
    expression: `(() => {
      const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('进入驱动'));
      if (enterBtn) enterBtn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 1200));

  // 1. 验证在 触发行程 页面下 hover 按键 D 的悬浮窗
  await send('Runtime.evaluate', {
    expression: `(() => {
      const triggerTab = document.querySelector('button[data-tab="trigger"]');
      if (triggerTab) triggerTab.click();
      const subTrigger = document.querySelector('button[data-subtab="trigger"]');
      if (subTrigger) subTrigger.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));

  // 触发 D 键 hover 事件
  await send('Runtime.evaluate', {
    expression: `(() => {
      const keys = Array.from(document.querySelectorAll('button'));
      const dKey = keys.find(b => b.textContent && (b.textContent.trim() === 'D' || b.textContent.includes('D')) && b.style.width);
      if (dKey) {
        dKey.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
      }
    })()`,
  });
  await new Promise((r) => setTimeout(r, 500));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_tooltip_trigger.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured verify_tooltip_trigger.png');

  // 2. 验证在 死区设置 页面下 hover 按键 D 的悬浮窗
  await send('Runtime.evaluate', {
    expression: `(() => {
      const subDeadzone = document.querySelector('button[data-subtab="deadzone"]');
      if (subDeadzone) subDeadzone.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const keys = Array.from(document.querySelectorAll('button'));
      const dKey = keys.find(b => b.textContent && (b.textContent.trim() === 'D' || b.textContent.includes('D')) && b.style.width);
      if (dKey) {
        dKey.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
      }
    })()`,
  });
  await new Promise((r) => setTimeout(r, 500));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_tooltip_deadzone.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured verify_tooltip_deadzone.png');

  // 3. 验证在 轴体设置 页面下 hover 按键 D 的悬浮窗
  await send('Runtime.evaluate', {
    expression: `(() => {
      const subSwitch = document.querySelector('button[data-subtab="switch"]');
      if (subSwitch) subSwitch.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const keys = Array.from(document.querySelectorAll('button'));
      const dKey = keys.find(b => b.textContent && (b.textContent.trim() === 'D' || b.textContent.includes('D')) && b.style.width);
      if (dKey) {
        dKey.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
      }
    })()`,
  });
  await new Promise((r) => setTimeout(r, 500));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_tooltip_switch.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured verify_tooltip_switch.png');

  // 4. 清除 hover，切换到【改键配置】页面，验证 Win Base / Win Fn / Mac Base / Mac Fn
  await send('Runtime.evaluate', {
    expression: `(() => {
      const keybindTab = document.querySelector('button[data-tab="keybinds"]');
      if (keybindTab) keybindTab.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));

  // 截屏 Win Base
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_keybinds_win_base.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured verify_keybinds_win_base.png');

  // 点击 Win Fn
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.trim() === 'Win Fn');
      if (btn) btn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_keybinds_win_fn.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured verify_keybinds_win_fn.png');

  // 点击 Mac Base
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.trim() === 'Mac Base');
      if (btn) btn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_keybinds_mac_base.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured verify_keybinds_mac_base.png');

  // 点击 Mac Fn
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.trim() === 'Mac Fn');
      if (btn) btn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_keybinds_mac_fn.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured verify_keybinds_mac_fn.png');

  ws.close();
  process.exit(0);
})();
