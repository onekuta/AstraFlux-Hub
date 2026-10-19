const fs = require('fs');

const text = fs.readFileSync('official_index_v2_dev.js', 'utf8');

// Look at the exports at the end: zy as C, Zy as c
console.log('Searching for definitions of zy and Zy...');
let idxZy = text.indexOf('Zy=');
if (idxZy !== -1) {
  console.log('Zy at', idxZy, ':', text.substring(idxZy - 20, idxZy + 800));
}

let idxzy = text.indexOf('zy=');
if (idxzy !== -1) {
  console.log('zy at', idxzy, ':', text.substring(idxzy - 20, idxzy + 800));
}
