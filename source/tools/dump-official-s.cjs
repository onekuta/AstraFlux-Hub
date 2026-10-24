const fs = require('fs');
const content = fs.readFileSync('scratch/main.1e6e89d87476c9ca15fc.js', 'utf8');

const start = content.indexOf('_s=[{en:"SOCD"');
if (start !== -1) {
  // Find the end of _s array
  const end = content.indexOf('];', start);
  console.log('--- OFFICIAL _s ARRAY ---');
  console.log(content.slice(start, end + 2));
} else {
  console.log('Not found');
}
