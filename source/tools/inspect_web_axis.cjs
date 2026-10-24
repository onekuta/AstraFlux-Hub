const fs = require('fs');

async function main() {
  const res = await fetch('https://v2-dev.xsyd.top/index.html');
  const html = await res.text();
  const scriptMatches = [...html.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
  console.log('Scripts:', scriptMatches);

  for (const src of scriptMatches) {
    const fullUrl = src.startsWith('http') ? src : 'https://v2-dev.xsyd.top' + (src.startsWith('/') ? '' : '/') + src;
    console.log('Fetching', fullUrl);
    const sRes = await fetch(fullUrl);
    const code = await sRes.text();
    // Search for keywords related to axis, calibration, ae64, 300d
    const keywords = ['12608', '19504', '3550', '天际线', '天王', '神马', 'getAxis', 'getDefaultAxis', 'axis/list', 'axis_list', 'axisList', 'calibration'];
    for (const kw of keywords) {
      let idx = 0;
      let count = 0;
      while ((idx = code.indexOf(kw, idx)) !== -1 && count < 3) {
        console.log(`[${src}] Match "${kw}" at ${idx}:`);
        console.log(code.substring(Math.max(0, idx - 80), Math.min(code.length, idx + 120)));
        idx += kw.length;
        count++;
      }
    }
  }
}

main().catch(console.error);
