async function test32k() {
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

  // 1. 回到主页
  await send('Runtime.evaluate', {
    expression: `(() => {
      const homeBtn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.includes('设备主页'));
      if (homeBtn) homeBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // 2. 检查主页是否有 32k 弹窗 (应该为 false)
  const homeCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('[role="dialog"]');
      return { hasModalOnHome: !!modal };
    })()`,
    returnByValue: true
  });
  console.log('主页主菜单弹窗检查:', homeCheck.result.value);

  // 3. 点击进入 ES68 破晓 (32K 键盘)
  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('立即连接'));
      if (btn) {
        btn.click();
        return { clicked: true, text: btn.innerText };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('点击 ES68 破晓 立即连接:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 1200));

  // 4. 检查进入 32K 键盘后是否弹出了 32k 驱动提示弹窗
  const modalCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('[role="dialog"]');
      return {
        has32kModalOnDevicePage: !!modal,
        text: modal ? modal.innerText.replace(/\\s+/g, ' ') : null
      };
    })()`,
    returnByValue: true
  });
  console.log('进入 32K 键盘页面后的弹窗结果:', modalCheck.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  require('fs').writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_32k_modal_on_device_page.png', Buffer.from(shot.data, 'base64'));
  console.log('已保存进入 32K 键盘后的弹窗截图!');

  ws.close();
}

test32k().catch(console.error);
