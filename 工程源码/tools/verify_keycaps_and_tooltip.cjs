const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

async function main() {
  const targetsRes = await fetch('http://127.0.0.1:9333/json');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    console.error('No page target found');
    process.exit(1);
  }

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

  await new Promise((res) => { ws.onopen = res; });
  console.log('Connected to CDP');

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  await new Promise(r => setTimeout(r, 800));

  // 1. 设置 mock higher keys 到 localStorage
  await send('Runtime.evaluate', {
    expression: `(() => {
      const mockHigherKeys = [
        { id: 'hk-1', type: 'RS', name: '动态行程', keys: ['KeyA', 'A'] },
        { id: 'hk-2', type: 'DKS', name: '动态键程', keys: ['KeyD', 'D'] },
        { id: 'hk-3', type: 'SOCD', name: '对冲覆盖', keys: ['KeyW', 'W'] },
      ];
      localStorage.setItem('sparklink_configured_higher_keys', JSON.stringify(mockHigherKeys));
    })()`
  });

  // 刷新页面让 localStorage 生效
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  // 2. 点击进入 AE64-MAX 驱动详情页
  const enterRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('进入驱动'));
      if (btn) {
        btn.click();
        return { success: true, text: btn.innerText };
      }
      return { success: false };
    })()`,
    returnByValue: true
  });
  console.log('点击进入驱动结果:', enterRes.result.value);
  await new Promise(r => setTimeout(r, 1500));

  // 3. 检查是否有 32k 弹窗并关闭
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('[title="关闭"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('不再提醒'));
      if (closeBtn) closeBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  // 4. 切换到【触发配置】
  const switchTriggerRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const triggerBtn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '触发配置');
      if (triggerBtn) {
        triggerBtn.click();
        return { success: true };
      }
      return { success: false };
    })()`,
    returnByValue: true
  });
  console.log('切换触发配置结果:', switchTriggerRes.result.value);
  await new Promise(r => setTimeout(r, 1000));

  // 5. 检查按键 DOM 结构（KeyA: RS + 0.01 / KeyD: DKS + 0.01 / KeyW: SOCD + 0.01 / Backspace / CapsLock）
  const keyInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const inspect = (id) => {
        const el = document.querySelector(\`[data-key-id="\${id}"]\`);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const centerSpan = el.querySelector('.flex-1 span');
        const bottomDiv = el.children[el.children.length - 1];
        return {
          id,
          text: el.innerText.replace(/\\n/g, ' '),
          centerFontSize: centerSpan ? window.getComputedStyle(centerSpan).fontSize : null,
          bottomContent: bottomDiv ? bottomDiv.innerText.replace(/\\n/g, ' ') : null
        };
      };

      return {
        keyA: inspect('KeyA'),
        keyD: inspect('KeyD'),
        keyW: inspect('KeyW'),
        keyCaps: inspect('CapsLock'),
        keyBack: inspect('Backspace'),
        keySpace: inspect('Space')
      };
    })()`,
    returnByValue: true
  });
  console.log('按键结构与渲染检验:', JSON.stringify(keyInfo.result.value, null, 2));

  // 截取全键盘图，展示字符与共存徽标
  const fullKbShot = await send('Page.captureScreenshot', { format: 'png' });
  const kbShotPath = path.join(ARTIFACT_DIR, 'verify_keyboard_character_and_badges.png');
  fs.writeFileSync(kbShotPath, Buffer.from(fullKbShot.data, 'base64'));
  console.log('已保存键盘全景截图:', kbShotPath);

  // 6. 模拟鼠标 hover 到 KeyA 上，唤出悬浮窗 Tooltip
  const keyAPos = await send('Runtime.evaluate', {
    expression: `(() => {
      const keyA = document.querySelector('[data-key-id="KeyA"]');
      if (!keyA) return null;
      const r = keyA.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`,
    returnByValue: true
  });
  console.log('KeyA 坐标:', keyAPos.result.value);

  if (keyAPos.result.value) {
    const { x, y } = keyAPos.result.value;
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y,
    });
    await new Promise(r => setTimeout(r, 800));

    // 检查 Tooltip 内容
    const tooltipInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const tooltips = Array.from(document.querySelectorAll('div')).filter(d => 
          d.innerText && d.innerText.includes('KeyA') && d.innerText.includes('触发灵敏度')
        );
        const tip = tooltips[tooltips.length - 1];
        if (!tip) return { found: false };
        return {
          found: true,
          text: tip.innerText.replace(/\\n/g, ' | '),
          hasHigherKeyBadge: tip.innerText.includes('RS'),
          hasHigherKeyDesc: tip.innerText.includes('动态行程') || tip.innerText.includes('高级按键')
        };
      })()`,
      returnByValue: true
    });
    console.log('Tooltip 检验结果:', tooltipInfo.result.value);

    // 截取 Hover 时的 Tooltip 截图
    const tooltipShot = await send('Page.captureScreenshot', { format: 'png' });
    const tipShotPath = path.join(ARTIFACT_DIR, 'verify_key_hover_tooltip_with_higher_key.png');
    fs.writeFileSync(tipShotPath, Buffer.from(tooltipShot.data, 'base64'));
    console.log('已保存悬浮窗 Tooltip 截图:', tipShotPath);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
