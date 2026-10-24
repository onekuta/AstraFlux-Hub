const fs = require('fs');

const svgs = JSON.parse(fs.readFileSync('official_lighting_svgs.json', 'utf8'));

for (let i = 0; i <= 18; i++) {
  const s = svgs[i];
  console.log(`=== L${i + 1} (mode ${i}) ===`);
  // Print paths and descriptions
  const paths = s.match(/<path[^>]+>/g) || [];
  const circles = s.match(/<circle[^>]+>/g) || [];
  const rects = s.match(/<rect[^>]+>/g) || [];
  console.log(`Elements: ${paths.length} paths, ${circles.length} circles, ${rects.length} rects`);
  console.log(s);
}
