const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
console.log('Top of v2-views.js:');
console.log(content.slice(0, 1000));
