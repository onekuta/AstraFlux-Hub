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

    const result = await evalJs(`(async () => {
      const devices = await navigator.hid.getDevices();
      // 找到真正具有 0xffb0 usagePage 的 ES68 设备！
      const vendorDev = devices.find(d => 
        d.vendorId === 7334 && d.productId === 7204 &&
        d.collections?.some(c => c.usagePage === 0xffb0)
      );

      if (!vendorDev) return { error: '未找到 0xffb0 设备' };

      // 导入 SDK 测试
      const KeyboardSDK = (await import('/src/services/keyboardService.js')).keyboardService;
      
      // 测试通过 SDK 连接该 vendorDev
      const sdk = KeyboardSDK.sdk || KeyboardSDK.initSDK();
      const sdkDevices = await sdk.getDevices();
      const targetSdkDev = sdkDevices.find(d => 
        d.vendorId === 7334 && d.productId === 7204 &&
        d.collections?.some(c => c.usagePage === 0xffb0)
      );

      let initRes = null;
      if (targetSdkDev) {
        initRes = await sdk.init(targetSdkDev.id);
      }

      // 测试读取设备信息
      let devInfo = null, perfW = null, cfg = null, light = null, rate = null;
      try { devInfo = await sdk.getDevicesInfo(); } catch(e) { devInfo = e.message; }
      try { perfW = await sdk.getPerformance({ row: 1, col: 2 }); } catch(e) { perfW = e.message; }
      try { cfg = await sdk.getConfig(); } catch(e) { cfg = e.message; }
      try { rate = await sdk.getRateOfReturn(); } catch(e) { rate = e.message; }
      try { light = await sdk.getLightingBase({ area: 'Keyboard', config: 'Base', lamp: 'SingleLighting' }); } catch(e) { light = e.message; }

      return {
        vendorDevFound: !!vendorDev,
        targetSdkDevFound: !!targetSdkDev,
        targetSdkDevId: targetSdkDev?.id,
        devInfo,
        perfW,
        cfg,
        rate,
        light
      };
    })()`);

    console.log('VENDOR_TEST_RESULT:', JSON.stringify(result, null, 2));

    ws.close();
    process.exit(0);
  });
});
