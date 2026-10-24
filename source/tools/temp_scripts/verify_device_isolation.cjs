const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;

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

async function runTest() {
  console.log('[1/6] 启动星闪悦动HUB带 CDP 端口 9222...');
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
    console.error('无法连接到 CDP 调试端口 9222');
    process.exit(1);
  }

  console.log('[2/6] 连接 CDP WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);
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

  console.log('[3/6] 导航至 AE64-MAX 高级配置页并配置 AE64-MAX 独有高级键...');
  await evalCode(`window.location.hash = ''; window.history.pushState({}, '', '?profile=ae64_max&view=device&tab=advanced'); window.location.reload();`);
  await sleep(2500);

  // 验证当前 AE64-MAX 的隔离 storage key
  const aeInfo = await evalCode(`(() => {
    // 为 AE64-MAX 写入两条专属高级按键: W(SOCD), A(RS)
    const aeKey = 'sparklink_configured_higher_keys_profile_ae64_max';
    const testConfigs = [
      { id: 'socd-W-E', type: 'SOCD', name: '设定优先 (SOCD)', keys: ['W', 'E'], desc: '后覆盖 · 0ms延迟' },
      { id: 'rs-A-D', type: 'RS', name: '迅洁 (RS)', keys: ['A', 'D'], desc: '双向急停' }
    ];
    localStorage.setItem(aeKey, JSON.stringify(testConfigs));
    return {
      aeKey,
      items: JSON.parse(localStorage.getItem(aeKey))
    };
  })()`);
  console.log('AE64-MAX 配置写入完成:', aeInfo);

  // 刷新以触发加载
  await evalCode(`window.location.reload();`);
  await sleep(2500);

  const aeCheck = await evalCode(`(() => {
    // 检查虚拟键盘上按键徽标
    const badges = Array.from(document.querySelectorAll('.keycap-lite, button[data-key-id]')).map(el => {
      const id = el.getAttribute('data-key-id');
      const badge = el.querySelector('.higher-key-badge, .badge, [class*="badge"]')?.textContent?.trim();
      return { id, badge, text: el.innerText };
    }).filter(x => x.text && (x.text.includes('SOCD') || x.text.includes('RS') || x.badge));
    return { badgesCount: badges.length, badges: badges.slice(0, 5) };
  })()`);
  console.log('AE64-MAX 页面渲染结果:', aeCheck);
  await takeScreenshot('verify_isolation_ae64_configured.png');

  console.log('[4/6] 切换至 ES68 键盘...');
  await evalCode(`window.history.pushState({}, '', '?profile=es68&view=device&tab=advanced'); window.location.reload();`);
  await sleep(2500);

  const esCheck = await evalCode(`(() => {
    const esKey = 'sparklink_configured_higher_keys_profile_es68';
    const esStorage = localStorage.getItem(esKey);
    const badges = Array.from(document.querySelectorAll('.keycap-lite, button[data-key-id]')).map(el => {
      const id = el.getAttribute('data-key-id');
      const badge = el.querySelector('.higher-key-badge, .badge, [class*="badge"]')?.textContent?.trim();
      return { id, badge, text: el.innerText };
    }).filter(x => x.text && (x.text.includes('SOCD') || x.text.includes('RS') || x.badge));
    
    // 检查概览列表项
    const configCards = Array.from(document.querySelectorAll('[data-config-card], .config-card, .advanced-item')).length;
    return {
      esKey,
      esStorage: esStorage ? JSON.parse(esStorage) : null,
      badgesCount: badges.length,
      configCards
    };
  })()`);
  console.log('ES68 检查结果 (必须完全无 AE64 键位污染):', esCheck);
  await takeScreenshot('verify_isolation_es68_clean.png');

  console.log('[5/6] 在 ES68 上配置独有的 Space (DKS) 高级键...');
  await evalCode(`(() => {
    const esKey = 'sparklink_configured_higher_keys_profile_es68';
    const esConfigs = [
      { id: 'dks-Space', type: 'DKS', name: '动态键程 (DKS)', keys: ['Space'], desc: '4阶触发行程' }
    ];
    localStorage.setItem(esKey, JSON.stringify(esConfigs));
  })()`);
  await evalCode(`window.location.reload();`);
  await sleep(2500);

  const esConfiguredCheck = await evalCode(`(() => {
    const badges = Array.from(document.querySelectorAll('.keycap-lite, button[data-key-id]')).map(el => {
      const id = el.getAttribute('data-key-id');
      const text = el.innerText;
      return { id, text };
    }).filter(x => x.text && x.text.includes('DKS'));
    return { dksBadges: badges };
  })()`);
  console.log('ES68 独有 DKS 结果:', esConfiguredCheck);
  await takeScreenshot('verify_isolation_es68_configured_dks.png');

  console.log('[6/6] 再次切换回 AE64-MAX，验证配置完全互不干扰...');
  await evalCode(`window.history.pushState({}, '', '?profile=ae64_max&view=device&tab=advanced'); window.location.reload();`);
  await sleep(2500);

  const aeFinalCheck = await evalCode(`(() => {
    const aeKey = 'sparklink_configured_higher_keys_profile_ae64_max';
    const esKey = 'sparklink_configured_higher_keys_profile_es68';
    const aeItems = JSON.parse(localStorage.getItem(aeKey) || '[]');
    const esItems = JSON.parse(localStorage.getItem(esKey) || '[]');
    
    // 检查页面上是否有 DKS (绝不能有)
    const hasDksOnAe = Array.from(document.querySelectorAll('button[data-key-id]')).some(el => el.innerText.includes('DKS'));
    // 检查页面上是否有 SOCD 和 RS (必须保留)
    const hasSocdOnAe = Array.from(document.querySelectorAll('button[data-key-id]')).some(el => el.innerText.includes('SOCD'));
    const hasRsOnAe = Array.from(document.querySelectorAll('button[data-key-id]')).some(el => el.innerText.includes('RS'));

    return {
      aeItemsCount: aeItems.length,
      esItemsCount: esItems.length,
      hasDksOnAe,
      hasSocdOnAe,
      hasRsOnAe
    };
  })()`);
  console.log('最终多设备强隔离验证结果:', aeFinalCheck);
  await takeScreenshot('verify_isolation_ae64_restored.png');

  ws.close();
  console.log('✅ 自动化回归测试执行完毕！');
}

runTest().catch((err) => {
  console.error('测试异常:', err);
  process.exit(1);
});
