const fs = require('fs');

async function test() {
  const url = 'https://v2-dev.xsyd.top/js/index-C51E5yMc.js';
  const res = await fetch(url);
  const text = await res.text();
  for (const kw of ['calibrationStart', 'getCalibrationStatus', 'GFSCalibration', 'GFSCalibrate']) {
    let idx = text.indexOf(kw);
    while (idx !== -1) {
      console.log('Match', kw, 'at', idx);
      console.log(text.substring(Math.max(0, idx - 100), Math.min(text.length, idx + 300)));
      idx = text.indexOf(kw, idx + kw.length);
    }
  }
}

test();
