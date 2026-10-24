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

    const evalJs = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (res.exceptionDetails) {
        return { error: res.exceptionDetails.text, desc: res.exceptionDetails.exception?.description };
      }
      return res.result ? res.result.value : null;
    };

    // 等待 3 秒
    await new Promise(r => setTimeout(r, 3000));

    const res = await evalJs(`(async () => {
      const ks = window.__keyboardService;
      if (!ks) return { error: 'window.__keyboardService 未定义' };

      const isConn = ks.connected;
      const dev = ks.device;
      const prof = ks.deviceProfile;

      // 测试 SDK 暴露方法与当前连接设备
      const sdkDevs = ks.sdk ? await ks.sdk.getDevices() : [];
      
      // 测试当前读取真实板载数据
      let rate = null, cfg = null, cfgList = null, light = null, perf = null, info = null;
      try { rate = await ks.getRateOfReturn(); } catch(e) { rate = e.message; }
      try { cfg = await ks.getCurrentBoardConfig(); } catch(e) { cfg = e.message; }
      try { cfgList = await ks.getBoardConfigList(); } catch(e) { cfgList = e.message; }
      try { light = await ks.sdk?.getLightingBase({ area: 'Keyboard', config: 'Base', lamp: 'SingleLighting' }); } catch(e) { light = e.message; }
      try { perf = await ks.getPerformance(1, 2); } catch(e) { perf = e.message; }
      try { info = await ks.sdk?.getDevicesInfo(); } catch(e) { info = e.message; }

      return {
        isConn,
        dev: dev ? {
          name: dev.productName,
          vid: dev.vendorId,
          pid: dev.productId,
          collections: dev.collections?.map(c => ({
            up: '0x' + c.usagePage?.toString(16),
            u: '0x' + c.usage?.toString(16)
          }))
        } : null,
        profileId: prof?.id,
        sdkDevsCount: sdkDevs.length,
        sdkDevs: sdkDevs.map(d => ({
          name: d.productName,
          vid: d.vendorId,
          pid: d.productId,
          id: d.id,
          collections: d.collections?.map(c => ({
            up: '0x' + c.usagePage?.toString(16),
            u: '0x' + c.usage?.toString(16)
          }))
        })),
        info,
        rate,
        cfg,
        cfgList,
        light,
        perf
      };
    })()`);

    console.log('LIVE_STATUS:', JSON.stringify(res, null, 2));

    ws.close();
    process.exit(0);
  });
});
