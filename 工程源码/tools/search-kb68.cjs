const fs = require('fs');
const content = fs.readFileSync('scratch/main.1e6e89d87476c9ca15fc.js', 'utf8');
let idx = 0;
while ((idx = content.indexOf('keyboardType:"68"', idx)) !== -1) {
  console.log('at', idx, content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
  idx += 17;
}
