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

  await new Promise(r => setTimeout(r, 1000));

  // 1. 如果在首页，点击进入驱动详情
  await send('Runtime.evaluate', {
    expression: `(() => {
      const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('进入驱动'));
      if (enterBtn) enterBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  // 关闭 32k 弹窗（如果存在）
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('[title="关闭"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('不再提醒'));
      if (closeBtn) closeBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  // ==========================================
  // 测试 1: 验证【按键选中状态跨 Tab 独立隔离】
  // ==========================================
  console.log('--- 测试 1: 跨 Tab 选中隔离 ---');
  // 1.1 先切换到【触发配置】
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '触发配置');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // 1.2 在【触发配置】中点击【全选按键】
  const selectAllRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const selectAllBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('全选按键'));
      if (selectAllBtn) selectAllBtn.click();
      const countEl = Array.from(document.querySelectorAll('span, div')).find(el => el.innerText && el.innerText.includes('已选中'));
      return { clicked: !!selectAllBtn, countText: countEl ? countEl.innerText : null };
    })()`,
    returnByValue: true
  });
  console.log('触发配置点击全选:', selectAllRes.result.value);

  // 1.3 切换到【改键配置】
  const switchKeybindsRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes('改键配置'));
      if (btn) btn.click();
      return { clicked: !!btn };
    })()`,
    returnByValue: true
  });
  console.log('切换到改键配置:', switchKeybindsRes.result.value);
  await new Promise(r => setTimeout(r, 800));

  // 1.4 检查改键配置下的选中数量：必须为 0 颗按键，绝对不继承触发配置的全选！
  const keybindsSelectionCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const topCountEl = Array.from(document.querySelectorAll('span, div')).find(el => el.innerText && el.innerText.includes('已选中'));
      const promptEl = Array.from(document.querySelectorAll('span')).find(el => el.innerText && (el.innerText.includes('尚未在上方选中按键') || el.innerText.includes('目标受选键')));
      return {
        topCountText: topCountEl ? topCountEl.innerText.replace(/\\s+/g, ' ') : null,
        promptText: promptEl ? promptEl.innerText.replace(/\\s+/g, ' ') : null
      };
    })()`,
    returnByValue: true
  });
  console.log('改键配置下的按键选中状态检查 (应为 0 颗且提示未选中):', keybindsSelectionCheck.result.value);

  // 1.5 在改键配置中单独选中一颗按键（如 KeyQ）
  await send('Runtime.evaluate', {
    expression: `(() => {
      const keyQ = document.querySelector('[data-key-id="KeyQ"]');
      if (keyQ) keyQ.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  // 1.6 切回【触发配置】
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes('触发配置'));
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // 检查触发配置是否恢复了全选状态
  const triggerRestoredCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const topCountEl = Array.from(document.querySelectorAll('span, div')).find(el => el.innerText && el.innerText.includes('已选中'));
      return { countText: topCountEl ? topCountEl.innerText.replace(/\\s+/g, ' ') : null };
    })()`,
    returnByValue: true
  });
  console.log('切回触发配置后恢复的历史状态 (应依然为全选):', triggerRestoredCheck.result.value);

  // 1.7 再次切回【改键配置】
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes('改键配置'));
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  const keybindsRestoredCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const topCountEl = Array.from(document.querySelectorAll('span, div')).find(el => el.innerText && el.innerText.includes('已选中'));
      return { countText: topCountEl ? topCountEl.innerText.replace(/\\s+/g, ' ') : null };
    })()`,
    returnByValue: true
  });
  console.log('再次切回改键配置后恢复的历史状态 (应依然为 1 颗 Q):', keybindsRestoredCheck.result.value);

  // ==========================================
  // 测试 2: 验证【窗口比例与尺寸自适应修复】
  // ==========================================
  console.log('--- 测试 2: 页面窗口比例与键盘尺寸检查 ---');
  const sizeCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const keyA = document.querySelector('[data-key-id="KeyA"]');
      const kb = keyA ? keyA.parentElement : null;
      const kbWrap = kb ? kb.parentElement : null;
      const bottomPanel = document.querySelector('.panel-operation-keybinds');
      const keyARect = keyA ? keyA.getBoundingClientRect() : null;

      return {
        kbWrapWidth: kbWrap ? Math.round(kbWrap.clientWidth) : null,
        kbWrapHeight: kbWrap ? Math.round(kbWrap.clientHeight) : null,
        keyboardWidth: kb ? Math.round(kb.clientWidth) : null,
        keyboardHeight: kb ? Math.round(kb.clientHeight) : null,
        bottomPanelHeight: bottomPanel ? Math.round(bottomPanel.clientHeight) : null,
        keyAWidth: keyARect ? Math.round(keyARect.width) : null,
        keyAHeight: keyARect ? Math.round(keyARect.height) : null,
      };
    })()`,
    returnByValue: true
  });
  console.log('改键页面尺寸测量:', sizeCheck.result.value);

  // 截图改键页面整体比例
  const shotKeybinds = await send('Page.captureScreenshot', { format: 'png' });
  const shotKeybindsPath = path.join(ARTIFACT_DIR, 'verify_keybinds_window_proportions.png');
  fs.writeFileSync(shotKeybindsPath, Buffer.from(shotKeybinds.data, 'base64'));
  console.log('已保存改键页面比例截图:', shotKeybindsPath);

  // ==========================================
  // 测试 3: 验证【直接从下方拖拽按键替换上方目标按键】
  // ==========================================
  console.log('--- 测试 3: 拖拽改键功能测试 ---');
  // 模拟把下方 104 键盘的 F1 按键，直接拖拽到上方的 KeyW 按键上！
  const dragDropRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const targetKeyW = document.querySelector('[data-key-id="KeyW"]');
      if (!targetKeyW) return { error: '未找到上方目标按键 KeyW' };

      // 构造携带 F1 键码的 DataTransfer 载荷
      const payload = {
        id: 'F1',
        label: 'F1',
        desc: '按键 F1',
        type: 'key'
      };

      const dt = new DataTransfer();
      dt.setData('application/json', JSON.stringify(payload));
      dt.setData('text/plain', JSON.stringify(payload));

      // 触发 DragOver 与 Drop 事件
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      targetKeyW.dispatchEvent(dragOverEvent);

      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      targetKeyW.dispatchEvent(dropEvent);

      return {
        dragged: true,
        targetKeyTextBefore: targetKeyW.innerText.replace(/\\n/g, ' ')
      };
    })()`,
    returnByValue: true
  });
  console.log('拖拽事件派发结果:', dragDropRes.result.value);
  await new Promise(r => setTimeout(r, 600));

  // 检查 KeyW 的改键状态是否已成功变为 F1 (显示 [已改键] / [F1] / 原:W)
  const keyWAfterDrop = await send('Runtime.evaluate', {
    expression: `(() => {
      const targetKeyW = document.querySelector('[data-key-id="KeyW"]');
      if (!targetKeyW) return null;
      return {
        text: targetKeyW.innerText.replace(/\\n/g, ' '),
        hasF1: targetKeyW.innerText.includes('F1'),
        hasReplacedBadge: targetKeyW.innerText.includes('已改键')
      };
    })()`,
    returnByValue: true
  });
  console.log('KeyW 拖拽替换后的渲染结果:', keyWAfterDrop.result.value);

  // 截取拖拽成功后的改键页面全屏图
  const shotDragSuccess = await send('Page.captureScreenshot', { format: 'png' });
  const shotDragPath = path.join(ARTIFACT_DIR, 'verify_keybinds_drag_and_drop_success.png');
  fs.writeFileSync(shotDragPath, Buffer.from(shotDragSuccess.data, 'base64'));
  console.log('已保存拖拽替换成功截图:', shotDragPath);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
