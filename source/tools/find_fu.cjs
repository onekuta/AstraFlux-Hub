const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const idx = content.indexOf('yu=Y(fu');
const fuDef = content.lastIndexOf('fu=', idx);
console.log('fu= index:', fuDef);
console.log(content.slice(fuDef - 50, Math.min(content.length, fuDef + 3000)));
