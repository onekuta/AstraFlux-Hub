const fs = require('fs');

const files = ['tools/official_device.js', 'tools/official_index.js', 'tools/v2-views.js'];
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  let idx = content.indexOf('getKeyCustomLighting');
  if (idx !== -1) {
    console.log(`[${f}] getKeyCustomLighting at ${idx}:`);
    console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 600)));
  }
}
