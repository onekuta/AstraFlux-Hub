async function test() {
  const res = await fetch('https://www.xsyd.top/v2-app/device');
  const html = await res.text();
  const scripts = Array.from(html.matchAll(/src=["']([^"']+\.js)["']/g)).map(m => m[1]);
  for (const s of scripts) {
    const fullUrl = s.startsWith('http') ? s : 'https://www.xsyd.top' + (s.startsWith('/') ? '' : '/v2-app/') + s;
    const name = s.split('/').pop();
    const sRes = await fetch(fullUrl);
    const text = await sRes.text();
    const chunkMatches = Array.from(text.matchAll(/["'](\.\/[^"']+\.js)["']/g)).map(m => m[1]);
    for (const cPath of chunkMatches) {
      const cUrl = 'https://www.xsyd.top/v2-app/js/' + cPath.replace(/^\.\//, '');
      const cName = cPath.split('/').pop();
      try {
        const cRes = await fetch(cUrl);
        const cText = await cRes.text();
        if (cText.includes('setLightingBase') || cText.includes('speed') && cText.includes('luminance')) {
          console.log('Found candidate in', cName);
          const regexes = [/setLightingBase[^{]*\{[^}]*\}/g, /speed:[^,}]+/g, /luminance:[^,}]+/g];
          for (const reg of regexes) {
            const matches = cText.match(reg);
            if (matches) {
              console.log('  match:', matches.slice(0, 5));
            }
          }
        }
      } catch (e) {}
    }
  }
}
test().catch(console.error);
