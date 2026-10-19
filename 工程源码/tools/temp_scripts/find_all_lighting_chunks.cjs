const fs = require('fs');

async function findModes() {
  const res = await fetch('https://www.xsyd.top/v2-app/device');
  const html = await res.text();
  const scripts = Array.from(html.matchAll(/src=["']([^"']+\.js)["']/g)).map(m => m[1]);
  for (const s of scripts) {
    const fullUrl = s.startsWith('http') ? s : 'https://www.xsyd.top' + (s.startsWith('/') ? '' : '/v2-app/') + s;
    const sRes = await fetch(fullUrl);
    const text = await sRes.text();
    const chunkMatches = Array.from(text.matchAll(/["'](\.\/[^"']+\.js)["']/g)).map(m => m[1]);
    console.log(`Checking ${chunkMatches.length} chunks from ${s}...`);
    for (const cPath of chunkMatches) {
      const cUrl = 'https://www.xsyd.top/v2-app/js/' + cPath.replace(/^\.\//, '');
      const cName = cPath.split('/').pop();
      try {
        const cRes = await fetch(cUrl);
        const cText = await cRes.text();
        if (cText.includes('随波逐流') || cText.includes('峰回路转')) {
          console.log('>>> Found in', cName, cUrl);
          fs.writeFileSync('tools/temp_scripts/' + cName, cText);
        }
      } catch (e) {}
    }
  }
}
findModes().catch(console.error);
