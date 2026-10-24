const fs = require('fs');

async function findChunks() {
  const code = await (await fetch('https://v2-dev.xsyd.top/js/index-C51E5yMc.js')).text();
  const chunkMatches = [...code.matchAll(/\"\/js\/[a-zA-Z0-9_-]+\.js\"/g)].map(m => m[0].replace(/\"/g, ''));
  console.log('Chunks found in index:', chunkMatches);

  // Also search for import(
  const importMatches = [...code.matchAll(/import\([\"']([^\"']+)[\"']\)/g)].map(m => m[1]);
  console.log('Import matches:', importMatches);

  // Search for .js
  const jsNames = [...code.matchAll(/[a-zA-Z0-9_-]+-[a-zA-Z0-9_-]{8}\.js/g)].map(m => m[0]);
  const uniqueJs = [...new Set(jsNames)];
  console.log('Unique chunk js names:', uniqueJs);
}

findChunks();
