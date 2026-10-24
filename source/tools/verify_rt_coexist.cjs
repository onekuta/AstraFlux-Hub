const fs = require('fs');
const path = require('path');
const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

(async () => {
  const targetsRes = await fetch('http://127.0.0.1:9333/json');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const cbs = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && cbs.has(m.id)) { cbs.get(m.id)(m.result); cbs.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise(r => { const i = id++; cbs.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');

  // 点击全选按键，并开启快速触发 (RT)
  await send('Runtime.evaluate', {
    expression: `(() => {
      // 点击全选按键
      const selectAllBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('全选按键'));
      if (selectAllBtn) selectAllBtn.click();

      // 点击开启快速触发 (RT) checkbox
      const rtCheckbox = Array.from(document.querySelectorAll('input[type="checkbox"]')).find(c => c.closest('div') && c.closest('div').innerText.includes('快速触发'));
      if (rtCheckbox && !rtCheckbox.checked) {
        rtCheckbox.click();
      }

      // 点击预览显示中的 '快速触发 (RT)' 按钮
      const rtPreviewBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('快速触发 (RT)'));
      if (rtPreviewBtn) rtPreviewBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // 检查 KeyA, KeyD, KeyW, KeyS 的底部内容
  const check = await send('Runtime.evaluate', {
    expression: `(() => {
      const inspect = (id) => {
        const el = document.querySelector('[data-key-id="' + id + '"]');
        if (!el) return null;
        return {
          id,
          text: el.innerText.replace(/\\n/g, ' '),
          bottomContent: el.children[el.children.length - 1]?.innerText.replace(/\\n/g, ' ')
        };
      };
      return {
        keyA: inspect('KeyA'),
        keyD: inspect('KeyD'),
        keyW: inspect('KeyW'),
        keyS: inspect('KeyS')
      };
    })()`,
    returnByValue: true
  });
  console.log('RT 模式下的按键微标与参数:', check.result.value);

  // 截取当前预览图
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.join(ARTIFACT_DIR, 'verify_rt_preview_badge_coexist.png');
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('已保存 RT 模式按键微标并存截图:', shotPath);

  // 鼠标移动到 KeyA 上，截取 RT 开启状态下的 Tooltip
  const keyAPos = await send('Runtime.evaluate', {
    expression: `(() => {
      const keyA = document.querySelector('[data-key-id="KeyA"]');
      if (!keyA) return null;
      const r = keyA.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`,
    returnByValue: true
  });
  if (keyAPos.result.value) {
    const { x, y } = keyAPos.result.value;
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await new Promise(r => setTimeout(r, 800));

    const tipShot = await send('Page.captureScreenshot', { format: 'png' });
    const tipShotPath = path.join(ARTIFACT_DIR, 'verify_rt_active_tooltip_with_higher_key.png');
    fs.writeFileSync(tipShotPath, Buffer.from(tipShot.data, 'base64'));
    console.log('已保存 RT 开启时 Tooltip 截图:', tipShotPath);
  }

  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
