const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'scratch_v2');
const files = fs.readdirSync(dir);

console.log('Searching in', files.length, 'files...');

for (const f of files) {
  if (!f.endsWith('.js')) continue;
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  
  // Search for mode definitions or animation functions
  // Check if it has L1, L2, L3, L4, L5, L10, L16
  const hasModes = content.includes('L16') || content.includes('L10') || content.includes('L5');
  const hasAnimation = content.includes('requestAnimationFrame') || content.includes('setInterval');
  const hasKeyStyle = content.includes('--key-color') || content.includes('customLight');
  
  if (hasModes || hasKeyStyle) {
    console.log(`File ${f} (${content.length} bytes): hasModes=${hasModes}, hasAnimation=${hasAnimation}, hasKeyStyle=${hasKeyStyle}`);
  }
}
