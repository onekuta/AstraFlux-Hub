const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
let idx = content.indexOf('function Ys(');
if (idx === -1) idx = content.indexOf('Ys=');
console.log('Ys index:', idx);
console.log(content.slice(idx, Math.min(content.length, idx + 1500)));
