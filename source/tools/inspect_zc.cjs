const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const idx = content.indexOf('function Zc(');
const idx2 = idx === -1 ? content.indexOf('Zc=') : idx;
console.log('Zc index:', idx2);
console.log(content.slice(idx2, Math.min(content.length, idx2 + 4000)));
