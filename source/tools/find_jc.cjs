const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const idx = content.indexOf('function jc(');
const idx2 = idx === -1 ? content.indexOf('jc=') : idx;
console.log('jc index:', idx2);
console.log(content.slice(idx2, Math.min(content.length, idx2 + 3000)));
