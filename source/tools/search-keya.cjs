const fs = require('fs');
const files = [
  'scratch/main.888e7b80caf5faec5604.js',
  'scratch/main.1e6e89d87476c9ca15fc.js'
];
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  let idx = 0;
  while ((idx = content.indexOf('\"KeyA\"', idx)) !== -1) {
    console.log(f, 'KeyA at', idx, content.slice(Math.max(0, idx - 80), Math.min(content.length, idx + 200)));
    idx += 6;
  }
}
