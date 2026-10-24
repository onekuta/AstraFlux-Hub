const fs = require('fs');

const content = fs.readFileSync('scratch/main.1e6e89d87476c9ca15fc.js', 'utf8');

// Find advancedKey localization dictionary
const start = content.indexOf('"advancedKey":');
if (start !== -1) {
  console.log('--- FOUND advancedKey i18n ---');
  console.log(content.slice(start, start + 3500));
}

// Find higher key mode configs
const modeIdx = content.indexOf('titleKey:"keyboard.advancedKey.modeType');
if (modeIdx !== -1) {
  console.log('--- FOUND modeType definitions ---');
  console.log(content.slice(modeIdx - 200, modeIdx + 2000));
}
