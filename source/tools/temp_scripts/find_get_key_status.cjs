async function findGetKeyStatus() {
  const cUrl = 'https://www.xsyd.top/v2-app/js/index-DZtPZg-9.js';
  const cRes = await fetch(cUrl);
  const text = await cRes.text();

  let idx = 0;
  while ((idx = text.indexOf('getKeyStatus', idx)) !== -1) {
    console.log('getKeyStatus at', idx, ':');
    console.log(text.substring(Math.max(0, idx - 100), Math.min(text.length, idx + 400)).replace(/\n/g, ' '));
    console.log('----------------------------------------------------');
    idx += 12;
  }
}
findGetKeyStatus().catch(console.error);
