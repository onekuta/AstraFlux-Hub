const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 950 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Click on '高级键' tab
  const buttons = await page.$$('button');
  for (const t of buttons) {
    const text = await page.evaluate(el => el.textContent, t);
    if (text.includes('高级键')) {
      await t.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  const modes = ['SOCD', 'DKS', 'MPT', 'MT', 'TGL'];
  for (const mode of modes) {
    const btns = await page.$$('button');
    for (const b of btns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.trim() === mode) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: `C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_advanced_${mode.toLowerCase()}.png` });
  }

  await browser.close();
  console.log('All 5 screenshots taken successfully');
})().catch(e => {
  console.error(e);
  process.exit(1);
});
