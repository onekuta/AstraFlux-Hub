const fs = require('fs');

const bundle = fs.readFileSync('tools/official_bundle.js', 'utf8');

function findOccurrences(term) {
  let pos = 0;
  console.log(`\n=================== SEARCH: ${term} ===================`);
  let count = 0;
  while (count < 10) {
    const idx = bundle.indexOf(term, pos);
    if (idx === -1) break;
    console.log(`\n--- Match #${count + 1} at offset ${idx}:`);
    const start = Math.max(0, idx - 250);
    const end = Math.min(bundle.length, idx + 450);
    console.log(bundle.substring(start, end));
    pos = idx + term.length;
    count++;
  }
}

findOccurrences('trps');
findOccurrences('getHigherKey');
findOccurrences('highKeyMenu');
