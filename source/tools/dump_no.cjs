const fs = require('fs');

const content = fs.readFileSync('tools/official_index.js', 'utf8');
const idx = content.indexOf('nO={');
const endIdx = content.indexOf('};', idx);
const block = content.slice(idx, endIdx + 2);

// Extract all keys of nO
const keys = [];
const regex = /(\d+|light_\w+):new URL\("data:image\/svg\+xml,([^"]+)"/g;
let m;
while ((m = regex.exec(block)) !== null) {
  keys.push({ key: m[1], svg: decodeURIComponent(m[2]) });
}
console.log(`Found ${keys.length} icons in nO:`);
keys.forEach(k => console.log(k.key, k.svg.slice(0, 80)));
