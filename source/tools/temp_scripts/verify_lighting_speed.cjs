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

async function testLightingSpeeds() {
  console.log('[1/4] 启动应用并连接 CDP 9222...');
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

  console.log('[2/4] 直接导航至灯光配置页面 (?view=device&tab=lighting)...');
  await evalCode(`window.location.search = '?view=device&tab=lighting';`);
  await sleep(2500);

  // 截取基准 50% 速度下的灯光渲染
  await takeScreenshot('verify_lighting_speed_50.png');

  console.log('[3/4] 切换到暗香浮动 (呼吸模式) 并测试速度变化...');
  await evalCode(`(() => {
    // 找到包含 暗香浮动 的模式按钮并点击
    const modeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('暗香浮动'));
    if (modeBtn) modeBtn.click();
  })()`);
  await sleep(1500);
  await takeScreenshot('verify_lighting_breathing_mode.png');

  console.log('[4/4] 验证完成，关闭测试！');
  ws.close();
}

testLightingSpeeds().catch(console.error);
