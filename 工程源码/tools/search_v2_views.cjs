const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
let idx = 0;
while ((idx = content.search(/light/i)) !== -1) {
  console.log(`v2-views: idx ${idx}`);
  console.log(content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 250)));
  console.log('---');
  content_sub = content.slice(idx + 10);
  break;
}

// Search all occurrences with regex
const re = /lighting|lightMode|decorate/gi;
let match;
while ((match = re.exec(content)) !== null) {
  console.log(`Match ${match[0]} at ${match.index}:`);
  console.log(content.slice(Math.max(0, match.index - 80), Math.min(content.length, match.index + 200)));
  console.log('===');
}
