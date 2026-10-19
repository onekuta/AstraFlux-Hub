const https = require('https');
const fs = require('fs');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const files = [
    'assets/v2-CLVXJlMm.js',
    'assets/index-CUpE-eWh.js',
    'assets/WujieContainer.vue_vue_type_script_setup_true_lang-CyT5Xr3A.js'
  ];

  for (const f of files) {
    const url = 'https://www.xsyd.top/' + f;
    console.log('Downloading:', url);
    try {
      const content = await get(url);
      console.log(`Success: ${f}, size: ${content.length}`);
      fs.writeFileSync(`tools/${f.replace('assets/', '')}`, content);
    } catch (e) {
      console.error('Error downloading:', f, e.message);
    }
  }
}

main();
