const fs = require('fs');
const path = require('path');

const modes = JSON.parse(fs.readFileSync('official_modes_catalog.json', 'utf8'));

const outCode = [];
outCode.push('// 星闪悦动官方 1:1 动态灯效模式矢量图标 (L1 ~ L19)');
outCode.push('export const OFFICIAL_LIGHTING_ICONS = {');

for (const m of modes) {
  const num = m.mode + 1;
  const inPath = path.join(__dirname, 'official_svg_assets', `L${num}_inactive.svg`);
  const actPath = path.join(__dirname, 'official_svg_assets', `L${num}_active.svg`);
  
  const inSvg = fs.existsSync(inPath) ? fs.readFileSync(inPath, 'utf8') : '';
  const actSvg = fs.existsSync(actPath) ? fs.readFileSync(actPath, 'utf8') : '';

  outCode.push(`  ${m.mode}: {`);
  outCode.push(`    mode: ${m.mode},`);
  outCode.push(`    label: 'L${num}',`);
  outCode.push(`    inactiveSvg: ${JSON.stringify(inSvg)},`);
  outCode.push(`    activeSvg: ${JSON.stringify(actSvg)},`);
  outCode.push(`  },`);
}

outCode.push('};');
outCode.push('');

const targetFile = path.resolve(__dirname, '../src/constants/officialLightingIcons.js');
fs.writeFileSync(targetFile, outCode.join('\n'), 'utf8');
console.log('Successfully written', targetFile);
