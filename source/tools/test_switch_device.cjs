async function switchDevice() {
  const targetsRes = await fetch('http://127.0.0.1:9333/json');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id).resolve(msg.result);
      callbacks.delete(msg.id);
    }
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    callbacks.set(curId, { resolve });
    ws.send(JSON.stringify({ id: curId, method, params }));
  });
  await new Promise(r => { ws.onopen = r; });

  // 1. 点击切换设备下拉菜单
  const openDrop = await send('Runtime.evaluate', {
    expression: `(() => {
      const dropBtn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.includes('切换设备'));
      if (dropBtn) {
        dropBtn.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('打开切换设备下拉:', openDrop.result.value);
  await new Promise(r => setTimeout(r, 500));

  // 2. 选择 ES68 (32K 键盘)
  const selectEs68 = await send('Runtime.evaluate', {
    expression: `(() => {
      const items = Array.from(document.querySelectorAll('button, div'));
      const es68 = items.find(el => el.innerText && el.innerText.includes('ES68') && el.offsetParent !== null);
      if (es68) {
        es68.click();
        return { selected: true, text: es68.innerText.slice(0, 30) };
      }
      return { selected: false };
    })()`,
    returnByValue: true
  });
  console.log('选择 ES68 结果:', selectEs68.result.value);

  await new Promise(r => setTimeout(r, 1200));

  // 3. 检查是否弹出了 32K 驱动提示弹窗！
  const modalCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('[role="dialog"]');
      return {
        hasModal: !!modal,
        text: modal ? modal.innerText.replace(/\\s+/g, ' ') : null
      };
    })()`,
    returnByValue: true
  });
  console.log('切换到 ES68 (32K) 后的 32k 驱动提示弹窗检测:', modalCheck.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  require('fs').writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_switch_to_32k_modal.png', Buffer.from(shot.data, 'base64'));
  console.log('已保存切换到 32K 键盘后的弹窗截图!');

  ws.close();
}

switchDevice().catch(console.error);
