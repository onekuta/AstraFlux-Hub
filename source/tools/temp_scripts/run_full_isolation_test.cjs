const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const EXE_PATH = 'd:\\desk\\星闪悦动驱动\\软件本体\\星闪悦动HUB.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Lynan\\.gemini\\antigravity\\brain\\babc9b26-a62e-4b1e-955d-2be516999335';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('[1/5] 启动星闪悦动HUB...');
  const appProc = spawn(EXE_PATH, ['--remote-debugging-port=9222'], {
    detached: true,
    stdio: 'ignore'
  });
  appProc.unref();

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    try {
      const list = await getJson('http://127.0.0.1:9222/json/list');
      const page = list.find(p => p.type === 'page' || p.url.includes('index.html'));
      if (page && page.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('无法连接 CDP 端口 9222');
    process.exit(1);
  }

  const ws = new globalThis.WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let idCounter = 1;
  const pendingRequests = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  function sendCdp(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalCode(expression) {
    const res = await sendCdp('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  }

  async function takeScreenshot(fileName) {
    const res = await sendCdp('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACTS_DIR, fileName);
    fs.writeFileSync(outPath, buffer);
    console.log(`📸 截图已保存: ${outPath}`);
    return outPath;
  }

  console.log('[2/5] 切换至高级按键 Tab 并检查当前设备 ScopeKey...');
  await evalCode(`(() => {
    const advTabBtn = document.querySelector('button[data-tab="advanced"]');
    if (advTabBtn) advTabBtn.click();
  })()`);
  await sleep(1500);

  const scopeResult = await evalCode(`(() => {
    // 检查当前页面上的设备名称与 SN
    const snEl = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.startsWith('SN:'));
    return {
      sn: snEl ? snEl.innerText : null,
      storageKeys: Object.keys(localStorage).filter(k => k.includes('higher_keys') || k.includes('custom_key'))
    };
  })()`);
  console.log('当前设备信息与存储 key:', scopeResult);

  console.log('[3/5] 在高级按键中点击预设卡片并保存一条配置...');
  const addResult = await evalCode(`(() => {
    // 查找包含 SOCD 的卡片点击进入
    const socdCard = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.includes('设定优先 (SOCD)'));
    if (socdCard) socdCard.click();
    return true;
  })()`);
  await sleep(1000);

  // 点击快速设置并保存
  const saveResult = await evalCode(`(() => {
    // 找到表单中的按键1和按键2输入框或者快速预设按钮
    const quickPresetBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('W / E') || b.innerText.includes('A / D'));
    if (quickPresetBtn) quickPresetBtn.click();
    
    // 点击保存配置并应用
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('保存'));
    if (saveBtn) {
      saveBtn.click();
      return 'saved';
    }
    return 'saveBtn not found';
  })()`);
  console.log('保存操作:', saveResult);
  await sleep(1500);

  const storageAfterSave = await evalCode(`(() => {
    const keys = Object.keys(localStorage).filter(k => k.includes('higher_keys'));
    const map = {};
    keys.forEach(k => { map[k] = JSON.parse(localStorage.getItem(k)); });
    return map;
  })()`);
  console.log('保存后的设备隔离存储状态:', storageAfterSave);
  await takeScreenshot('verify_device_isolated_after_save.png');

  console.log('[4/5] 验证旧全局 key sparklink_configured_higher_keys 是否存在...');
  const legacyCheck = await evalCode(`localStorage.getItem('sparklink_configured_higher_keys')`);
  console.log('旧全局 key (必须为 null 彻底杜绝跨设备污染):', legacyCheck);

  console.log('[5/5] 测试完成，关闭连接！');
  ws.close();
}

main().catch(err => {
  console.error('测试失败:', err);
  process.exit(1);
});
