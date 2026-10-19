const fs = require('fs');

const chunks = ['index-DChfwETo.js', 'lighting-B4XSvIkX.js', 'handle-BAe56l0V.js'];
for (const c of chunks) {
  const text = fs.readFileSync('official_chunks/' + c, 'utf8');
  for (const fn of ['rt=', 'function rt(', 'lightingRaf', 'handleLightDynamicModeChange']) {
    let idx = 0;
    while ((idx = text.indexOf(fn, idx)) !== -1) {
      console.log(`[${c}] Found "${fn}" at ${idx}:`);
      console.log(text.substring(Math.max(0, idx - 40), Math.min(text.length, idx + 400)));
      idx += fn.length;
    }
  }
}
