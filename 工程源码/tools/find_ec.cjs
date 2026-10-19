const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const idx = content.indexOf('ec=');
console.log('ec= index:', idx);
console.log(content.slice(idx, Math.min(content.length, idx + 2500)));
