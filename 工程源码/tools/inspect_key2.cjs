const fs = require('fs');

const text = fs.readFileSync('official_index_v2_dev.js', 'utf8');
const idx = text.indexOf('Zy={');
const block = text.substring(idx);
const p2 = block.indexOf('2:new URL(');
const p3 = block.indexOf('3:new URL(');

const s = block.substring(p2, p3);
const raw = s.substring(s.indexOf('data:image/svg+xml,') + 'data:image/svg+xml,'.length, s.indexOf('",import'));
console.log('Key 2 (L3) Decoded SVG:');
console.log(decodeURIComponent(raw));
