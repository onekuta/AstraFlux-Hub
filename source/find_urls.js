const fs = require('fs');

const code = fs.readFileSync('tools/index-CUpE-eWh.js', 'utf8');
const urls = code.match(/https?:\/\/[a-zA-Z0-9_\-\.\:\/]+/g);
console.log('URLs in tools/index-CUpE-eWh.js:', [...new Set(urls)]);
