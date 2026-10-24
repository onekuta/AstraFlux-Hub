const http = require('http');
const fs = require('fs');

async function main() {
  const json = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9333/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
  console.log('Targets:', json.map(t => ({ title: t.title, url: t.url })));
  const page = json.find(t => t.type === 'page' || t.title.includes('星闪悦动') || t.url.includes('index.html')) || json[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 0;
  const pending = {};
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      pending[i] = r;
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending[m.id]) pending[m.id](m.result);
  };
  await new Promise((r) => { ws.onopen = r; });
  console.log('CDP connected');

  async function screenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/' + filename, Buffer.from(res.data, 'base64'));
    console.log('Saved:', filename);
  }

  // 1. Enter keyboard page
  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText && (b.innerText.includes("进入驱动") || b.innerText.includes("立即连接")));
      if (btn) {
        btn.click();
        return { clicked: true, text: btn.innerText };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('Enter device result:', clickRes.result.value);
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss any 32k modal if present
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText && (b.innerText.includes("我知道了") || b.innerText.includes("关闭") || b.innerText.includes("取消")));
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // 1. Trigger Tab Screenshot
  await screenshot('verify_trigger_crisp_typography.png');

  // Hover over a key to show tooltip with higher contrast & larger font
  await send('Runtime.evaluate', {
    expression: `(() => {
      const key = Array.from(document.querySelectorAll("button")).find(b => b.textContent.trim().startsWith("Q"));
      if (key) {
        key.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  await screenshot('verify_tooltip_crisp_typography.png');

  // 2. Switch to Performance tab
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tab = Array.from(document.querySelectorAll("button, div")).find(el => el.textContent.trim() === "性能配置");
      if (tab) tab.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  await screenshot('verify_perf_crisp_typography.png');

  // 3. Switch to Keybinds tab
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tab = Array.from(document.querySelectorAll("button, div")).find(el => el.textContent.trim() === "改键配置");
      if (tab) tab.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  await screenshot('verify_keybinds_crisp_typography.png');

  // 4. Switch to Switch Setting (轴体选择)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const triggerTab = Array.from(document.querySelectorAll("button, div")).find(el => el.textContent.trim() === "按键行程" || el.textContent.trim() === "触发配置");
      if (triggerTab) triggerTab.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 500));
  await send('Runtime.evaluate', {
    expression: `(() => {
      const switchBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("选择轴体") || b.title?.includes("展开全量轴体"));
      if (switchBtn) switchBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  await screenshot('verify_switches_crisp_typography.png');

  ws.close();
  console.log('Finished capturing all screenshots!');
}

main().catch(console.error);
