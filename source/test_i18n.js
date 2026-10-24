const fs = require('fs');
const content = fs.readFileSync('tools/vue-i18n-C3FoiNQh.js', 'utf8');

const regex = /"([^"]*light[^"]*)"/gi;
let m;
const matches = [];
while ((m = regex.exec(content)) !== null) {
  matches.push(m[1]);
}
console.log('Matches:', [...new Set(matches)]);
