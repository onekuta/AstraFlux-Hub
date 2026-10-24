const fs = require('fs');

const content = fs.readFileSync('tools/official_index.js', 'utf8');
const idx = content.indexOf('"L1",id:0}');
console.log('Surrounding index:', idx);
console.log(content.slice(Math.max(0, idx - 1000), Math.min(content.length, idx + 4000)));
