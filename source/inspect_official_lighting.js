const fs = require('fs');

function searchFile(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  console.log('Searching', file, 'length:', content.length);

  // Search for mode array or lighting functions
  const patterns = [
    /label:\s*["']L1["']/g,
    /mode:\s*[0-9]+/g,
    /dynamic.*mode/gi,
    /keyCustomLighting/gi
  ];
  
  let idx = 0;
  while ((idx = content.indexOf('label:"L1"', idx)) !== -1) {
    console.log('Found label:"L1" at', idx);
    console.log(content.slice(idx - 50, idx + 600));
    idx += 20;
  }
}

searchFile('tools/index-D-Vi6Arc.js');
searchFile('scratch/index-C51E5yMc.js');
