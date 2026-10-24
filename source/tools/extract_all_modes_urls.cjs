const fs = require('fs');

const text = fs.readFileSync('official_index_v2_dev.js', 'utf8');

function extractMap(varName) {
  const startStr = varName + '={';
  const startIdx = text.indexOf(startStr);
  if (startIdx === -1) return null;
  const contentStart = startIdx + startStr.length;
  // find matching closing brace
  let depth = 1;
  let endIdx = contentStart;
  while (depth > 0 && endIdx < text.length) {
    if (text[endIdx] === '{') depth++;
    else if (text[endIdx] === '}') depth--;
    endIdx++;
  }
  const block = text.substring(contentStart, endIdx - 1);
  console.log(`Block ${varName} extracted, length:`, block.length);

  const items = {};
  // matches: key:new URL("...",import.meta.url).href
  // or key:new URL('...',import.meta.url).href
  const regex = /(\d+):new URL\((['"])(.*?)\2,import\.meta\.url\)\.href/g;
  let m;
  while ((m = regex.exec(block)) !== null) {
    items[Number(m[1])] = m[3];
  }
  return items;
}

const zyObj = extractMap('zy'); // active
const ZyObj = extractMap('Zy'); // inactive

console.log('zy (active) keys:', Object.keys(zyObj));
console.log('Zy (inactive) keys:', Object.keys(ZyObj));

const allModes = [];
for (let i = 0; i <= 18; i++) {
  allModes.push({
    mode: i,
    label: `L${i + 1}`,
    inactiveUrl: ZyObj[i],
    activeUrl: zyObj[i]
  });
  console.log(`\nL${i + 1} (mode ${i}):`);
  console.log('  inactive:', (ZyObj[i] || '').substring(0, 80));
  console.log('  active:  ', (zyObj[i] || '').substring(0, 80));
}

fs.writeFileSync('official_modes_catalog.json', JSON.stringify(allModes, null, 2), 'utf8');
