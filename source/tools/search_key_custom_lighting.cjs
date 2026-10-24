const fs = require('fs');

const files = ['handle-BAe56l0V.js', 'lighting-B4XSvIkX.js', '../official_index_v2_dev.js'];
for (const f of files) {
  const p = f.startsWith('../') ? f.replace('../', '') : 'official_chunks/' + f;
  if (!fs.existsSync(p)) continue;
  const text = fs.readFileSync(p, 'utf8');
  let idx = 0;
  while ((idx = text.indexOf('getKeyCustomLighting', idx)) !== -1) {
    console.log(`[${f}] Found getKeyCustomLighting at ${idx}:`);
    console.log(text.substring(Math.max(0, idx - 40), Math.min(text.length, idx + 400)));
    idx += 20;
  }
}
