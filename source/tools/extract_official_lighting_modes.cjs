const fs = require('fs');

const text = fs.readFileSync('official_index_v2_dev.js', 'utf8');

// Zy = unselected icons (0..18)
// zy = selected icons (0..18)
const idxZy = text.indexOf('Zy={0:');
const idxZyEnd = text.indexOf('};', idxZy);
const zyBlock = text.substring(idxZy, idxZyEnd + 2);

console.log('Found Zy block length:', zyBlock.length);

const out = {};
for (let i = 0; i <= 18; i++) {
  const match = zyBlock.match(new RegExp(`${i}:new URL\\("([^"]+)"\\)`));
  if (match) {
    const dataUrl = match[1];
    const svgEncoded = dataUrl.replace('data:image/svg+xml,', '');
    const svgDecoded = decodeURIComponent(svgEncoded);
    out[i] = svgDecoded;
    console.log(`--- L${i + 1} (id: ${i}) ---`);
    console.log(svgDecoded);
  }
}

fs.writeFileSync('official_lighting_svgs.json', JSON.stringify(out, null, 2), 'utf8');
console.log('Saved all decoded SVGs to official_lighting_svgs.json');
