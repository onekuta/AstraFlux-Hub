const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const idx = content.indexOf('xl=');
console.log('xl= index:', idx);
console.log(content.slice(idx - 100, Math.min(content.length, idx + 2000)));

const idxOl = content.indexOf('Ol=');
console.log('Ol= index:', idxOl);
console.log(content.slice(idxOl - 100, Math.min(content.length, idxOl + 2000)));
