const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const match = content.match(/from"\.\/index-D-Vi6Arc\.js"/);
if (match) {
  const start = content.lastIndexOf('import', match.index);
  console.log(content.slice(start, match.index + 35));
}
