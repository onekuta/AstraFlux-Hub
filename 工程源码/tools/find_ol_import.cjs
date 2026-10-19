const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const idx = content.indexOf('z as Ol');
const start = content.lastIndexOf('import', idx);
const end = content.indexOf(';', idx);
console.log(content.slice(start, end + 1));
