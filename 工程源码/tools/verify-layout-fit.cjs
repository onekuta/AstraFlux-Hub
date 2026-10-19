const http = require('http');

http.get('http://127.0.0.1:9333/json', async (r) => {
  let d = ''; r.on('data', c => d += c);
  r.on('end', async () => {
    const list = JSON.parse(d);
    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(res => ws.onopen = res);
    let id = 0;
    const send = (m, p = {}) => new Promise((res) => {
      const i = ++id;
      const handler = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === i) { ws.removeEventListener('message', handler); res(msg.result); }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: i, method: m, params: p }));
    });
    await send('Runtime.enable');
    await send('Page.enable');

    const evalJs = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return res.result ? res.result.value : null;
    };

    console.log('====== [1/3] 验证 1100x700 视口贴合度与滚动条 ======');
    await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 700, deviceScaleFactor: 1, mobile: false });
    const base = page.url.split('?')[0];
    await send('Page.navigate', { url: base + '?view=device&tab=trigger&profile=es68' });
    await new Promise(r => setTimeout(r, 4000));

    const fitCheck = await evalJs(`(() => {
      const appContent = document.querySelector('.app-content');
      const panel = document.querySelector('.panel-operation');
      const kbCard = document.querySelector('.app-content > div:first-child');
      const switchSubTabBtn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('轴体设置'));
      return {
        winH: innerHeight,
        appContentH: appContent ? appContent.clientHeight : 0,
        appContentScrollH: appContent ? appContent.scrollHeight : 0,
        hasVerticalScrollbar: appContent ? appContent.scrollHeight > appContent.clientHeight : false,
        kbCardH: kbCard ? Math.round(kbCard.getBoundingClientRect().height) : 0,
        panelH: panel ? Math.round(panel.getBoundingClientRect().height) : 0,
        // 当前默认轴体文案
        axisTitle: document.querySelector('.panel-operation .font-title') ? document.querySelector('.panel-operation .font-title').innerText : null,
        axisSubtitle: document.querySelector('.panel-operation span.truncate.block') ? document.querySelector('.panel-operation span.truncate.block').innerText : null,
        keycapSwitchName: document.querySelector('.keycap-lite span') ? document.querySelector('.keycap-lite span').innerText : null,
      };
    })()`);
    console.log('1100x700 贴合数据:', JSON.stringify(fitCheck, null, 2));

    console.log('====== [2/3] 验证轴体库紧凑布局与选项密度 ======');
    await evalJs(`(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('轴体设置'));
      if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 1500));

    const switchGridCheck = await evalJs(`(() => {
      const cards = document.querySelectorAll('.panel-operation .grid > div');
      const firstCard = cards[0];
      const r = firstCard ? firstCard.getBoundingClientRect() : null;
      return {
        cardCount: cards.length,
        firstCardSize: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
        cardNames: [...cards].slice(0, 8).map(c => c.querySelector('span.text-xs')?.innerText),
        selectedAxisName: document.querySelector('.panel-operation strong')?.innerText,
      };
    })()`);
    console.log('轴体库紧凑网格数据:', JSON.stringify(switchGridCheck, null, 2));

    console.log('====== [3/3] 验证公模客制化 PCB 默认轴体为磁玉 Pro ======');
    await send('Page.navigate', { url: base + '?view=device&tab=trigger&profile=generic_sparklink_kb' });
    await new Promise(r => setTimeout(r, 4000));

    const genericCheck = await evalJs(`(() => {
      return {
        axisTitle: document.querySelector('.panel-operation .font-title')?.innerText,
        axisSubtitle: document.querySelector('.panel-operation span.truncate.block')?.innerText,
        keycapSwitchName: document.querySelector('.keycap-lite span')?.innerText,
      };
    })()`);
    console.log('公模/客制化 默认轴体数据:', JSON.stringify(genericCheck, null, 2));

    ws.close();
    process.exit(0);
  });
});
