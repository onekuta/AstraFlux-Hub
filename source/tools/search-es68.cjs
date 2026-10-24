const fs = require('fs');

const files = [
  'scratch/main.f8e5777ff051023749db.js',
  'scratch/main.888e7b80caf5faec5604.js',
  'scratch/main.1e6e89d87476c9ca15fc.js'
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  console.log('--- Checking', file, '---');
  let idx = 0;
  while ((idx = content.indexOf('ES68', idx)) !== -1) {
    console.log('Match ES68 at', idx, ':');
    console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
    idx += 5;
  }
}
