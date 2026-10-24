const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Lynan\\.gemini\\antigravity\\brain\\31aaf3cf-ac99-4434-84bd-f0b85977629a';

function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9333/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(t => t.type === 'page' || t.url?.includes('index.html')) || list[0];
          if (!page || !page.webSocketDebuggerUrl) {
            reject(new Error('未找到调试页面'));
          } else {
            resolve(page.webSocketDebuggerUrl);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const wsUrl = await getWsUrl();
  console.log('连接 CDP:', wsUrl);
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = idCounter++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

  console.log('[1/6] 刷新应用页面并进入设备驱动详情页...');
  await send('Page.enable');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2500));

  // 点击进入驱动
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('进入驱动'));
        if (enterBtn) enterBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  console.log('[2/6] 截取设备详情主界面与侧边栏设备卡片 (SN 码展示)...');
  const snap1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_hw_sn.png'), Buffer.from(snap1.data, 'base64'));
  console.log('已保存 verify_hw_sn.png');

  console.log('[3/6] 点击展开侧边栏「切换设备」下拉菜单...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const switchBtn = document.querySelector('.device-card button:has(svg.lucide-chevron-down)');
        if (switchBtn) { switchBtn.click(); return 'clicked'; }
        return 'not_found';
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));
  const snap2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_switch_dropdown.png'), Buffer.from(snap2.data, 'base64'));
  console.log('已保存 verify_switch_dropdown.png');

  console.log('[4/6] 点击芯片图标打开「硬件出厂参数与SN码详情」模态弹窗...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        // 关闭下拉框
        const switchBtn = document.querySelector('.device-card button:has(svg.lucide-chevron-down)');
        if (switchBtn) switchBtn.click();
        
        // 点击芯片图标
        const cpuBtn = document.querySelector('.device-card button:has(svg.lucide-cpu)');
        if (cpuBtn) { cpuBtn.click(); return 'clicked_cpu'; }
        return 'not_found';
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));
  const snap3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_hw_modal.png'), Buffer.from(snap3.data, 'base64'));
  console.log('已保存 verify_hw_modal.png');

  console.log('[5/6] 关闭弹窗并切换至「其他设置」Tab 校验全量参数展示...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        // 关闭弹窗
        const finishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('完成'));
        if (finishBtn) finishBtn.click();

        // 切换到 settings tab
        const settingsTab = document.querySelector('button[data-tab="settings"]');
        if (settingsTab) settingsTab.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));
  const snap4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_settings_hw.png'), Buffer.from(snap4.data, 'base64'));
  console.log('已保存 verify_settings_hw.png');

  ws.close();
  console.log('全部验证截图完成！');
}

run().catch(e => {
  console.error('CDP 验证错误:', e);
  process.exit(1);
});
