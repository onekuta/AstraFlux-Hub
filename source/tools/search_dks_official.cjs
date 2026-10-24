const fs = require('fs');

async function test() {
  const chunks = [
    'index-zF5RXdlA.js',
    'index-R0TJ5JmU.js',
    'index-CkWe4Mh7.js',
    'index-DChfwETo.js',
    'index-CioAS8JA.js',
    'index-DgDelmX2.js',
    'index-BHKKnEmz.js',
    'index-BxXeN3zP.js',
    'index-BarmaJRh.js',
    'index-C_55ydrG.js',
    'index-CfSeWtk3.js',
    'index-BUbtQxk0.js'
  ];

  for (const c of chunks) {
    const url = 'https://v2-dev.xsyd.top/js/' + c;
    try {
      const res = await fetch(url);
      const text = await res.text();
      for (const kw of ['按键下压', '按键释放', 'DKS', 'setHigherKeyDKS', 'setDks']) {
        let idx = text.indexOf(kw);
        if (idx !== -1) {
          console.log(`[${c}] Found "${kw}" at ${idx}:`);
          console.log(text.substring(Math.max(0, idx - 50), Math.min(text.length, idx + 250)));
        }
      }
    } catch (e) {
      console.log('Error fetching', c, e.message);
    }
  }
}

test().catch(e => console.error(e));
