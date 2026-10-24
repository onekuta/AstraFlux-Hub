const fs = require('fs');

const data = JSON.parse(fs.readFileSync('hardware_19_modes_sampled.json', 'utf8'));
data.forEach(item => {
  console.log(`\n=== Mode ${item.mode} (L${item.mode + 1}) ===`);
  if (item.error) {
    console.log('Error:', item.error);
    return;
  }
  item.frames.forEach((f, idx) => {
    console.log(`Frame ${idx}: r0_c0: ${JSON.stringify(f.r0_c0)} | r2_c7: ${JSON.stringify(f.r2_c7)} | r4_c6: ${JSON.stringify(f.r4_c6)}`);
  });
});
