const fs = require('fs');

async function searchLighting() {
  const chunks = [
    'lighting-B4XSvIkX.js',
    'index-BUbtQxk0.js',
    'index-C51E5yMc.js',
    'index-R0TJ5JmU.js',
    'index-CkWe4Mh7.js',
    'useInitPageHook-DN8zbmSd.js',
    'device.js'
  ];

  for (const c of chunks) {
    const url = 'https://v2-dev.xsyd.top/js/' + c;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();
      console.log(`=== File: ${c} (length: ${text.length}) ===`);
      for (const kw of ['lighting', 'lightMode', 'L1', 'L2', 'L3', 'L6', 'L7', 'L19', 'modeName', 'modes', 'effect', 'animation', 'colors']) {
        let idx = 0;
        let count = 0;
        while ((idx = text.indexOf(kw, idx)) !== -1 && count < 2) {
          console.log(`[${c}] "${kw}" at ${idx}: ` + text.substring(Math.max(0, idx - 50), Math.min(text.length, idx + 150)));
          idx += kw.length;
          count++;
        }
      }
    } catch (e) {
      console.log('Error', c, e.message);
    }
  }
}

searchLighting();
