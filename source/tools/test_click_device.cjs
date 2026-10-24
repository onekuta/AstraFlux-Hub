// Native WebSocket
const fs = require('fs');
const path = require('path');

async function run() {
  const targetsRes = await fetch('http://127.0.0.1:9333/json');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const cb = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) cb.reject(msg.error);
      else cb.resolve(msg.result);
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    callbacks.set(curId, { resolve, reject });
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => {
    ws.onopen = r;
  });

  // 1. 点击进入第一个已连接设备（AE64-MAX）
  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('进入驱动'));
      if (btn) {
        btn.click();
        return { clicked: true, text: btn.innerText };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('点击进入驱动按钮:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 1000));

  // 切换到【触发配置】
  await send('Runtime.evaluate', {
    expression: `(() => {
      const triggerTab = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '触发配置');
      if (triggerTab) triggerTab.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 800));

  // 截图
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.resolve('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_trigger_tab_aligned_clean.png');
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('已保存触发配置截图:', shotPath);

  // 检查是否重叠
  const overlapCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const scaleMajor35 = Array.from(document.querySelectorAll('.vtravel-major')).find(el => el.innerText.includes('3.50'));
      const bottomText = Array.from(document.querySelectorAll('span, div')).find(el => el.innerText && el.innerText.includes('未选按键 (拖动仅手感预览'));
      if (!scaleMajor35 || !bottomText) {
        return { found: false, scaleMajor35: !!scaleMajor35, bottomText: !!bottomText };
      }
      const r1 = scaleMajor35.getBoundingClientRect();
      const r2 = bottomText.getBoundingClientRect();
      const isOverlap = !(r1.bottom < r2.top || r1.top > r2.bottom || r1.right < r2.left || r1.left > r2.right);
      return {
        found: true,
        scaleBottom: r1.bottom,
        bottomTextTop: r2.top,
        gapY: r2.top - r1.bottom,
        isOverlap
      };
    })()`,
    returnByValue: true
  });
  console.log('AP 卡片重叠与间距检测:', overlapCheck.result.value);

  // 2. 测试切换回主菜单，并进入 ES68 (32K 键盘)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const homeBtn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.includes('设备主页'));
      if (homeBtn) homeBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // 点击 ES68 破晓
  const clickEs68Res = await send('Runtime.evaluate', {
    expression: `(() => {
      const es68Card = Array.from(document.querySelectorAll('div, button')).find(el => el.innerText && el.innerText.includes('ES68') && el.innerText.includes('破晓'));
      if (es68Card) {
        const btn = es68Card.closest('.device-card, div')?.querySelector('button') || es68Card;
        btn.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('点击 ES68 结果:', clickEs68Res.result.value);

  await new Promise(r => setTimeout(r, 1200));

  // 检查进入 ES68 32K 键盘后的弹窗状态
  const check32k = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('[role="dialog"]');
      return {
        has32kModal: !!modal,
        modalText: modal ? modal.innerText.replace(/\\s+/g, ' ') : null
      };
    })()`,
    returnByValue: true
  });
  console.log('进入 ES68 (32K 方案) 后的弹窗检测:', check32k.result.value);

  const shot32k = await send('Page.captureScreenshot', { format: 'png' });
  const shot32kPath = path.resolve('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_es68_32k_modal_shown.png');
  fs.writeFileSync(shot32kPath, Buffer.from(shot32k.data, 'base64'));
  console.log('已保存 ES68 32K 弹窗截图:', shot32kPath);

  ws.close();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
