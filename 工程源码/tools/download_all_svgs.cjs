const fs = require('fs');
const path = require('path');

const modes = JSON.parse(fs.readFileSync('official_modes_catalog.json', 'utf8'));
const outDir = path.join(__dirname, 'official_svg_assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function main() {
  for (const m of modes) {
    const idx = m.mode;
    // Download or save inactive
    let inSvg = '';
    if (m.inactiveUrl.startsWith('data:image/svg+xml,')) {
      inSvg = decodeURIComponent(m.inactiveUrl.replace('data:image/svg+xml,', ''));
    } else if (m.inactiveUrl.startsWith('/svg/')) {
      const res = await fetch('https://v2-dev.xsyd.top' + m.inactiveUrl);
      inSvg = await res.text();
    }
    fs.writeFileSync(path.join(outDir, `L${idx + 1}_inactive.svg`), inSvg, 'utf8');

    // Download or save active
    let actSvg = '';
    if (m.activeUrl.startsWith('data:image/svg+xml,')) {
      actSvg = decodeURIComponent(m.activeUrl.replace('data:image/svg+xml,', ''));
    } else if (m.activeUrl.startsWith('/svg/')) {
      const res = await fetch('https://v2-dev.xsyd.top' + m.activeUrl);
      actSvg = await res.text();
    }
    fs.writeFileSync(path.join(outDir, `L${idx + 1}_active.svg`), actSvg, 'utf8');

    console.log(`L${idx + 1}: saved inactive (${inSvg.length}b), active (${actSvg.length}b)`);
  }
}

main().catch(console.error);
