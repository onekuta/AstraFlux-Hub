const fs = require('fs');

async function main() {
  const code = await (await fetch('https://v2-dev.xsyd.top/js/index-DChfwETo.js')).text();
  fs.writeFileSync('scratch/lighting_page.js', code);
  console.log('Saved lighting_page.js, length:', code.length);

  // Search for usages of ge
  const regex = /\bge\b/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    const idx = match.index;
    console.log(`Match at ${idx}:`);
    console.log(code.substring(Math.max(0, idx - 60), Math.min(code.length, idx + 120)));
    console.log('---');
  }
}

main();
