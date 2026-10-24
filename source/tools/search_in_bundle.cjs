const fs = require('fs');

async function search() {
  const code = await (await fetch('https://v2-dev.xsyd.top/js/index-C51E5yMc.js')).text();
  console.log('Total length:', code.length);

  const targets = ['getDefaultAxis', 'GFSDefaultAxisGet', 'axisList', 'currentAxis', 'axisSettingTab', 'selectAxis', 'calibrationSetting'];
  for (const t of targets) {
    let idx = 0;
    console.log(`=== Matches for ${t} ===`);
    let count = 0;
    while ((idx = code.indexOf(t, idx)) !== -1 && count < 5) {
      console.log(`[${idx}]: ` + code.substring(Math.max(0, idx - 100), Math.min(code.length, idx + 150)));
      idx += t.length;
      count++;
    }
  }
}

search();
