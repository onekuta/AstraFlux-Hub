const fs = require('fs');

const files = ['tools/v2-views.js', 'tools/official_index.js'];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  console.log(`Checking ${f} for lighting animation / canvas / raf...`);
  let idx = 0;
  while ((idx = content.indexOf('lightingRaf', idx)) !== -1) {
    console.log(`[${f}] lightingRaf at ${idx}:`);
    console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 400)));
    console.log('---');
    idx += 12;
  }
}
