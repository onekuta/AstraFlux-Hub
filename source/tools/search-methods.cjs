const fs = require('fs');
const content = fs.readFileSync('scratch/main.1e6e89d87476c9ca15fc.js', 'utf8');

const terms = ['getKeyLayoutStyle', 'getPerformance', 'getLightingBase', 'setLightingCustom', 'openWebDriver', 'getConfig', 'HigherKey'];

for (const t of terms) {
  let idx = 0;
  let count = 0;
  console.log(`=== Matches for [${t}] ===`);
  while ((idx = content.indexOf(t, idx)) !== -1 && count < 5) {
    console.log(`-- match at ${idx} --`);
    console.log(content.slice(Math.max(0, idx - 120), Math.min(content.length, idx + 250)));
    idx += t.length;
    count++;
  }
}
