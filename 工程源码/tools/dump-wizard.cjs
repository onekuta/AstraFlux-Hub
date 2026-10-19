const fs = require('fs');
const content = fs.readFileSync('scratch/main.1e6e89d87476c9ca15fc.js', 'utf8');

// Find Bs definition
const bsStart = content.indexOf('Bs={');
if (bsStart !== -1) {
  const bsEnd = content.indexOf('};', bsStart);
  console.log('--- Bs WIZARD DEFINITION ---');
  console.log(content.slice(bsStart, bsEnd + 2));
}

// Search for CS2, 赛车计划, MOBA, osu! in content
const keywords = ['在CS2中可实现', '赛车计划', 'MOBA游戏', '禁止宏', 'osu!'];
for (const kw of keywords) {
  const idx = content.indexOf(kw);
  if (idx !== -1) {
    console.log('KW:', kw, content.slice(idx - 100, idx + 200));
  }
}
