const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const idx = content.indexOf('yu=');
console.log('yu= index:', idx);
console.log(content.slice(idx, Math.min(content.length, idx + 4000)));
