const fs = require('fs');

const files = ['tools/vue-i18n-C3FoiNQh.js', 'tools/official_index.js', 'tools/v2_index-D-Vi6Arc.js'];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  console.log(`Checking ${f}...`);
  // Look for light mode definitions
  const matches = content.match(/"L1"[^}]+}|'L1'[^}]+}|L1:[^}]+}/g);
  if (matches) {
    console.log(`Matches in ${f}:`, matches.slice(0, 10));
  }
  
  // Look for "常亮"
  let idx = content.indexOf('常亮');
  while (idx !== -1) {
    console.log(`Found 常亮 at ${idx} in ${f}:`);
    console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 400)));
    console.log('======');
    idx = content.indexOf('常亮', idx + 100);
  }
}
