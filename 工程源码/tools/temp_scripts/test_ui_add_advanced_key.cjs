const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

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

async function runTest() {
  const list = await getJson('http://127.0.0.1:9222/json/list');
  const page = list.find(p => p.type === 'page' || p.url.includes('index.html'));
  if (!page || !page.webSocketDebuggerUrl) {
    console.error('未找到运行中的页面调试地址');
    process.exit(1);
  }

  const ws = new globalThis.WebSocket(page.webSocketDebuggerUrl);
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

  console.log('[1/4] 查看当前连接设备的 scopeKey...');
  const scopeKey = await evalCode(`(() => {
    // 检查 App 内部计算的当前 key
    const allKeys = Object.keys(localStorage);
    return {
      allStorageKeys: allKeys.filter(k => k.startsWith('sparklink_'))
    };
  })()`);
  console.log('当前 LocalStorage 中的 sparklink keys:', scopeKey);

  console.log('[2/4] 在当前界面点击 SOCD 按钮配置一条高级键...');
  const clickRes = await evalCode(`(() => {
    // 找到 SOCD 卡片并点击
    const socdCard = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.includes('设定优先 (SOCD)'));
    if (socdCard) {
      socdCard.click();
      return 'clicked socd card';
    }
    return 'socd card not found';
  })()`);
  console.log('点击结果:', clickRes);
  await sleep(1000);

  // 输入绑定按键 W 和 E 并点击保存
  const fillRes = await evalCode(`(() => {
    // 查找输入框或者点击快速预设
    const presetBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('W / E') || b.innerText.includes('保存'));
    // 直接调用保存或设置配置
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.trim() === '保存配置并应用');
    if (saveBtn) {
      saveBtn.click();
      return 'clicked save button directly';
    }
    return 'save btn not found, viewMode might be overview';
  })()`);
  console.log('保存按钮结果:', fillRes);

  await takeScreenshot('verify_advanced_tab_editor.png');
  ws.close();
}

runTest().catch(console.error);
