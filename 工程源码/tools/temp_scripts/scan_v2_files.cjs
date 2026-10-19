async function scanAllV2Files() {
  const fs = require('fs');
  const res = await fetch('https://www.xsyd.top/v2-app/device');
  const html = await res.text();
  const scripts = html.match(/src=["']([^"']+\.js)["']/g).map(s => s.replace(/src=["']/, '').replace(/["']/, ''));
  console.log('Scripts from HTML:', scripts);

  for (const s of scripts) {
    const fullUrl = s.startsWith('http') ? s : 'https://www.xsyd.top' + (s.startsWith('/') ? '' : '/v2-app/') + s;
    const name = s.split('/').pop();
    console.log(`Downloading and checking ${name}...`);
    const sRes = await fetch(fullUrl);
    const text = await sRes.text();
    
    // 搜索
    const terms = ['请打开键盘校准按钮', '键盘校准', 'travelTest', 'calibrationSetting', '4 mm', '0 mm', 'getRoute'];
    for (const t of terms) {
      if (text.includes(t)) {
        console.log(`  --> Found "${t}" in ${name}!`);
        let idx = text.indexOf(t);
        console.log('    ' + text.substring(Math.max(0, idx - 50), Math.min(text.length, idx + 200)).replace(/\n/g, ' '));
      }
    }

    // 检查是否有其它 chunk 引用
    const chunkMatches = text.match(/["'](\.\/[^"']+\.js)["']/g);
    if (chunkMatches) {
      for (const cm of chunkMatches) {
        const cPath = cm.replace(/["']/g, '');
        const cUrl = 'https://www.xsyd.top/v2-app/js/' + cPath.replace(/^\.\//, '');
        const cName = cPath.split('/').pop();
        console.log(`Checking sub-chunk ${cName} from ${cUrl}...`);
        try {
          const cRes = await fetch(cUrl);
          const cText = await cRes.text();
          for (const t of terms) {
            if (cText.includes(t)) {
              console.log(`  --> Found "${t}" in sub-chunk ${cName}!`);
              let idx = cText.indexOf(t);
              console.log('    ' + cText.substring(Math.max(0, idx - 50), Math.min(cText.length, idx + 200)).replace(/\n/g, ' '));
            }
          }
        } catch (e) {}
      }
    }
  }
}
scanAllV2Files().catch(console.error);
