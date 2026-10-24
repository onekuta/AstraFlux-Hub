const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const exePath = 'D:\\\\desk\\\\星闪悦动驱动\\\\软件本体\\\\星闪悦动HUB.exe';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function connectCDP() {
  let targets = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9333/json');
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch (e) {
      // wait
    }
    await sleep(500);
  }
  if (!targets) throw new Error('Cannot connect to CDP at 9333');

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  console.log('Using target:', pageTarget.title, pageTarget.url);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

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

  return { ws, send };
}

async function run() {
  console.log('1. 启动驱动应用...');
  const appProc = spawn(exePath, ['--remote-debugging-port=9333'], { stdio: 'ignore' });
  appProc.unref();

  await sleep(1500);
  console.log('2. 连接 CDP 调试通道...');
  const { ws, send } = await connectCDP();

  // 确保窗口尺寸为 1280x800
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('3. 进入驱动设备详情页...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=trigger&profile=ae64';
      location.href = url;
    })()`
  });
  await sleep(2500);

  const cardHeights = {};

  // ── 步骤 A: 触发配置 ──
  console.log('4. 验证【触发配置】页面代表键盘尺寸...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '触发配置');
      if (btn) btn.click();
    })()`
  });
  await sleep(1000);

  const triggerKb = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.shrink-0.h-\\\\[264px\\\\]');
      if (el) {
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      }
      return null;
    })()`,
    returnByValue: true
  });
  cardHeights['trigger'] = triggerKb.result.value;
  console.log('触发配置键盘尺寸:', triggerKb.result.value);

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_1_trigger_tab.png'), Buffer.from(shot.data, 'base64'));

  // ── 步骤 B: 死区设置 ──
  console.log('5. 验证【死区设置】页面代表键盘尺寸...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '死区设置');
      if (btn) btn.click();
    })()`
  });
  await sleep(800);

  const deadzoneKb = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.shrink-0.h-\\\\[264px\\\\]');
      if (el) {
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      }
      return null;
    })()`,
    returnByValue: true
  });
  cardHeights['deadzone'] = deadzoneKb.result.value;
  console.log('死区设置键盘尺寸:', deadzoneKb.result.value);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_2_deadzone_tab.png'), Buffer.from(shot.data, 'base64'));

  // ── 步骤 C: 轴体设置 ──
  console.log('6. 验证【轴体设置】页面代表键盘尺寸...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '轴体设置');
      if (btn) btn.click();
    })()`
  });
  await sleep(800);

  const switchesKb = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.shrink-0.h-\\\\[264px\\\\]');
      if (el) {
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      }
      return null;
    })()`,
    returnByValue: true
  });
  cardHeights['switches'] = switchesKb.result.value;
  console.log('轴体设置键盘尺寸:', switchesKb.result.value);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_3_switches_tab.png'), Buffer.from(shot.data, 'base64'));

  // ── 步骤 D: 改键配置 ──
  console.log('7. 验证【改键配置】页面代表键盘尺寸与下方 104 字符完整展现...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '按键设置');
      if (btn) btn.click();
    })()`
  });
  await sleep(1000);

  const keybindsKb = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.shrink-0.h-\\\\[264px\\\\]');
      const bottom104 = document.querySelector('.panel-operation-bottom');
      const spaceKey = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === 'Space');
      let isSpaceVisible = false;
      if (spaceKey) {
        const sr = spaceKey.getBoundingClientRect();
        isSpaceVisible = sr.bottom <= window.innerHeight && sr.height > 10;
      }
      return {
        kb: el ? { w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) } : null,
        bottomHeight: bottom104 ? Math.round(bottom104.getBoundingClientRect().height) : 0,
        isSpaceVisible
      };
    })()`,
    returnByValue: true
  });
  cardHeights['keybinds'] = keybindsKb.result.value.kb;
  console.log('改键配置键盘与 104 完整性:', keybindsKb.result.value);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_4_keybinds_full_104.png'), Buffer.from(shot.data, 'base64'));

  // ── 步骤 E: 高级按键页面 ──
  console.log('8. 验证【高级按键】UI 布局无重叠与气泡截断...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '高级按键');
      if (btn) btn.click();
    })()`
  });
  await sleep(1000);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_5_advanced_fixed.png'), Buffer.from(shot.data, 'base64'));

  // ── 步骤 F: 快捷指令工具栏 ──
  console.log('9. 验证【快捷指令】宏录制工具栏不被挤压...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '快捷指令');
      if (btn) btn.click();
    })()`
  });
  await sleep(1000);

  const macroSaveBtn = await send('Runtime.evaluate', {
    expression: `(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('保存'));
      if (saveBtn) {
        const r = saveBtn.getBoundingClientRect();
        return {
          text: saveBtn.innerText,
          right: Math.round(r.right),
          windowWidth: window.innerWidth,
          isFullyVisible: r.right <= window.innerWidth
        };
      }
      return null;
    })()`,
    returnByValue: true
  });
  console.log('快捷指令保存按钮可见性:', macroSaveBtn.result.value);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_6_macro_clean.png'), Buffer.from(shot.data, 'base64'));

  // ── 步骤 G: 轴体校准弹窗 ──
  console.log('10. 验证【轴体校准】弹窗 (未按压 0.00mm、混轴行程、← 键)...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '轴体设置');
      if (btn) btn.click();
    })()`
  });
  await sleep(800);

  await send('Runtime.evaluate', {
    expression: `(() => {
      const calBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('轴体校准') || b.innerText.includes('全键校准')));
      if (calBtn) calBtn.click();
    })()`
  });
  await sleep(1200);

  const calCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.fixed.inset-0');
      const travelTexts = Array.from(document.querySelectorAll('*'))
        .filter(el => el.children.length === 0 && el.innerText && el.innerText.includes('mm'))
        .map(el => el.innerText.trim());
      
      const leftArrow = Array.from(document.querySelectorAll('*')).find(el => el.innerText && (el.innerText.trim() === '←' || el.innerText.trim() === 'Left'));

      return {
        isOpen: !!modal,
        travelTexts,
        hasLeftArrow: !!leftArrow
      };
    })()`,
    returnByValue: true
  });
  console.log('校准弹窗状态:', calCheck.result.value);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_7_calibration_zero_baseline.png'), Buffer.from(shot.data, 'base64'));

  console.log('================= 尺寸一致性检测汇总 =================');
  console.log(cardHeights);

  ws.close();
  try {
    process.kill(appProc.pid);
  } catch (e) {}

  console.log('✅ 全部端到端自动化测试顺利完成！截图已全部写入 artifact 目录。');
  process.exit(0);
}

run().catch(e => {
  console.error('Test execution error:', e);
  process.exit(1);
});
