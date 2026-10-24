const fs = require('fs');

async function searchAllChunks() {
  const chunks = [
    'useScanThreeDAxisHook-ChFvQrBM.js',
    'index-zF5RXdlA.js',
    'index-D4ixmPtK.js',
    'index-R0TJ5JmU.js',
    'useInitPageHook-DN8zbmSd.js',
    'index-CkWe4Mh7.js',
    'index-DChfwETo.js',
    'index-CioAS8JA.js',
    'index-BrgRPNfZ.js',
    'index-DgDelmX2.js',
    'index-BHKKnEmz.js',
    'index-BxXeN3zP.js',
    'index-BarmaJRh.js',
    'index-C_55ydrG.js',
    'index-CfSeWtk3.js',
    'index-BUbtQxk0.js',
    'keyboard-map-BcumcdXN.js'
  ];

  for (const c of chunks) {
    const url = 'https://v2-dev.xsyd.top/js/' + c;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();
      for (const kw of ['getDefaultAxis', 'axis_range_max', 'getAxisList', 'currentAxis', '校准', '天际线', '12608', 'axisList']) {
        let idx = 0;
        let count = 0;
        while ((idx = text.indexOf(kw, idx)) !== -1 && count < 3) {
          console.log(`[${c}] Match "${kw}" at ${idx}:`);
          console.log(text.substring(Math.max(0, idx - 80), Math.min(text.length, idx + 120)));
          idx += kw.length;
          count++;
        }
      }
    } catch (e) {
      console.log('Error', c, e.message);
    }
  }
}

searchAllChunks();
