const fs = require('fs');
const content = fs.readFileSync('d:/desk/星闪悦动驱动/工程源码/tools/v2-views.js', 'utf8');

const idx = content.indexOf('$e={');
const end = content.indexOf('}', idx);
console.log(content.slice(idx, end + 1));
