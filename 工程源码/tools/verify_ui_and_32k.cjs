// Native WebSocket in Node 24
const fs = require('fs');
const path = require('path');

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

  await new Promise((res) => {
    ws.onopen = res;
  });
  console.log('Connected to CDP');

  await send('Page.enable');
  await send('Runtime.enable');

  // 等待 1 秒观察首页状态
  await new Promise(r => setTimeout(r, 1000));

  // 1. 验证首页（主菜单）状态：绝不弹出 32k 提示！
  const evalCheckHome = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('[role="dialog"]');
      const text = document.body.innerText;
      return {
        hasModal: !!modal,
        modalText: modal ? modal.innerText : null,
        isHomePage: text.includes('星闪客制化外设') || text.includes('选择设备') || text.includes('支持的星闪设备') || text.includes('已连接设备')
      };
    })()`,
    returnByValue: true
  });
  console.log('首页（主菜单）状态检查:', evalCheckHome.result.value);

  const homeScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  const homeShotPath = path.resolve('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_home_no_32k_prompt.png');
  fs.writeFileSync(homeShotPath, Buffer.from(homeScreenshot.data, 'base64'));
  console.log('已保存首页截图:', homeShotPath);

  // 2. 点击进入支持 32k 的键盘设备详情页
  const enterDeviceRes = await send('Runtime.evaluate', {
    expression: `(() => {
      // 查找进入键盘驱动详情的按钮或设备卡片
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => 
        (el.innerText && (el.innerText.includes('进入驱动') || el.innerText.includes('配置此设备') || el.innerText.includes('ES68') || el.innerText.includes('前行者'))) &&
        el.offsetParent !== null
      );
      if (btn) {
        btn.click();
        return { success: true, text: btn.innerText.slice(0, 30) };
      }
      return { success: false };
    })()`,
    returnByValue: true
  });
  console.log('进入设备详情页结果:', enterDeviceRes.result.value);

  // 等待 1.5 秒加载设备页面
  await new Promise(r => setTimeout(r, 1500));

  // 3. 检查进入 32k 键盘页面后是否弹出了 32k 驱动提示
  const evalCheckDeviceModal = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('[role="dialog"]');
      return {
        has32kModal: !!modal,
        modalText: modal ? modal.innerText.replace(/\\s+/g, ' ') : null
      };
    })()`,
    returnByValue: true
  });
  console.log('进入 32k 键盘后的弹窗状态:', evalCheckDeviceModal.result.value);

  const devicePromptScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  const promptShotPath = path.resolve('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_device_32k_prompt_active.png');
  fs.writeFileSync(promptShotPath, Buffer.from(devicePromptScreenshot.data, 'base64'));
  console.log('已保存进入键盘后的 32k 提示截图:', promptShotPath);

  // 4. 关闭 32k 提示弹窗，并切换到【触发配置】
  await send('Runtime.evaluate', {
    expression: `(() => {
      // 点击关闭或不再提醒或ESC
      const closeBtn = document.querySelector('[title="关闭"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('不再提醒'));
      if (closeBtn) closeBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // 切换到【触发配置】
  await send('Runtime.evaluate', {
    expression: `(() => {
      const triggerBtn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '触发配置');
      if (triggerBtn) triggerBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  // 5. 截取【触发配置】AP 卡片与全屏
  const triggerScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  const triggerShotPath = path.resolve('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_ap_card_aligned_perfect.png');
  fs.writeFileSync(triggerShotPath, Buffer.from(triggerScreenshot.data, 'base64'));
  console.log('已保存触发配置 AP 卡片最终截图:', triggerShotPath);

  // 6. 检查 AP 卡片元素是否重叠
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
  console.log('重叠检测结果:', overlapCheck.result.value);

  ws.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
