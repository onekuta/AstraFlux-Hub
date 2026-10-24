const fs = require('fs');
const http = require('http');
const path = require('path');

const base = 'http://127.0.0.1:9333';
const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/31aaf3cf-ac99-4434-84bd-f0b85977629a';

function get(p) {
  return new Promise((res, rej) => {
    http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej);
  });
}

(async () => {
  let list;
  try {
    list = JSON.parse(await get(base + '/json'));
  } catch (e) {
    console.log('CDP_UNREACHABLE ' + e.message);
    process.exit(1);
  }
  const page = list.find((t) => t.type === 'page') || list[0];
  if (!page || !page.webSocketDebuggerUrl) {
    console.log('NO_PAGE');
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = {};
  const send = (method, params = {}) =>
    new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) pending[m.id](m); };
  await new Promise((r) => { ws.onopen = r; });

  await send('Page.enable');
  await send('Runtime.enable');

  // 1. 刷新页面以加载最新的 asar 资源
  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 2200));

  // 2. 点击进入驱动，并切换到 改键配置 标签页
  await send('Runtime.evaluate', {
    expression: `(() => {
      const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('进入驱动'));
      if (enterBtn) enterBtn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 1200));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const keybindTab = document.querySelector('button[data-tab="keybinds"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('改键配置'));
      if (keybindTab) keybindTab.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 1000));

  // 截取【基础】分类
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_cat_basic.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Captured basic tab');

  // 遍历点击各个分类并截图验证
  const categories = ['特殊', '多媒体', '灯效', '控制', '组合键', '鼠标'];
  for (const cat of categories) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const catBtn = btns.find(b => b.innerText && b.innerText.trim() === '${cat}');
        if (catBtn) catBtn.click();
      })()`,
    });
    await new Promise((r) => setTimeout(r, 600));

    // 如果是组合键，点一下 CTRL 和 C
    if (cat === '组合键') {
      await send('Runtime.evaluate', {
        expression: `(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const ctrlBtn = btns.find(b => b.innerText && b.innerText.trim() === 'CTRL');
          if (ctrlBtn) ctrlBtn.click();
          const cBtn = btns.find(b => b.innerText && b.innerText.trim() === 'C');
          if (cBtn) cBtn.click();
        })()`,
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    const shotCat = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, `verify_cat_${cat}.png`), Buffer.from(shotCat.result.data, 'base64'));
    console.log(`Captured ${cat} tab`);
  }

  console.log('ALL CATEGORIES VERIFIED');
  ws.close();
  process.exit(0);
})();
