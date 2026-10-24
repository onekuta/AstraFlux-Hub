const fs = require('fs');

const text = fs.readFileSync('official_chunks/index-DChfwETo.js', 'utf8');

// Find where ze is used (ze is the computed property returning ge.slice(0, C))
let idx = 0;
while ((idx = text.indexOf('ze', idx)) !== -1) {
  console.log(`Matched "ze" at ${idx}:`);
  console.log(text.substring(Math.max(0, idx - 40), Math.min(text.length, idx + 250)));
  idx += 2;
}
