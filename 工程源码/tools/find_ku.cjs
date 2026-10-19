const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const idx = content.indexOf('wu=Y(ku');
const kuDef = content.lastIndexOf('ku=', idx);
console.log('ku= index:', kuDef);
console.log(content.slice(kuDef - 100, Math.min(content.length, kuDef + 4000)));
