const fs = require('fs');

const content = fs.readFileSync('tools/official_index.js', 'utf8');

// Find all occurrences of lighting in the language blocks
let idx = content.indexOf('socdModeCover:"Last Override"');
console.log('EN block:', content.slice(idx - 1000, idx + 1000));

// Now search for Chinese equivalent:
let cnIdx = content.indexOf('socdModeCover:"后发覆盖"');
if (cnIdx === -1) cnIdx = content.indexOf('socdModeCover:');
console.log('CN block:', content.slice(cnIdx - 1000, cnIdx + 1000));
