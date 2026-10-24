const fs = require('fs');

const content = fs.readFileSync('scratch_official/locales-CcRlSip5.js', 'utf8');

const regex = /"([^"]*light[^"]*)"/gi;
let m;
const matches = [];
while ((m = regex.exec(content)) !== null) {
  matches.push(m[1]);
}
console.log('Total matches:', matches.length);
console.log('Sample matches:', [...new Set(matches)].slice(0, 40));

// Search for L1..L19
for (let i = 1; i <= 20; i++) {
  const k = `L${i}`;
  const idx = content.indexOf(`"${k}"`);
  if (idx !== -1) {
    console.log(k, 'context:', content.slice(idx, idx + 150));
  }
}
