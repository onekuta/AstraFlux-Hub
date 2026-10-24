const fs = require('fs');

const files = ['tools/official_index.js', 'tools/v2-views.js', 'tools/official_bundle.js', 'tools/v2_index-D-Vi6Arc.js'];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  console.log(`Checking ${f}...`);
  // Look for "L1" or "L2" or lighting tab component
  const matches = content.match(/lightMode|light_mode|decorateLight|lamp/gi);
  if (matches) {
    console.log(`Found ${matches.length} lighting occurrences in ${f}`);
  }
}
