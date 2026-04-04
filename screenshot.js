// Playwright screenshot script for Vitalii Uzun portfolio
// Run: node screenshot.js
// Requires: npm install playwright

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FILE_PATH = 'file://' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'mobile',  width: 375,  height: 812 },
];

const SECTIONS = [
  { name: 'hero',    selector: '#hero' },
  { name: 'about',   selector: '#about' },
  { name: 'cases',   selector: '#cases' },
  { name: 'posts',   selector: '#posts' },
  { name: 'contact', selector: '#contact' },
];

(async () => {
  const outDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await chromium.launch();
  console.log('Browser launched');

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(FILE_PATH, { waitUntil: 'networkidle' });

    // Wait for fonts & GSAP
    await page.waitForTimeout(1200);

    // Full-page screenshot
    const fullPath = path.join(outDir, `full-${vp.name}.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`Saved: ${fullPath}`);

    // Per-section screenshots (desktop only)
    if (vp.name === 'desktop') {
      for (const section of SECTIONS) {
        try {
          const el = page.locator(section.selector);
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          const sectionPath = path.join(outDir, `section-${section.name}.png`);
          await el.screenshot({ path: sectionPath });
          console.log(`Saved: ${sectionPath}`);
        } catch (e) {
          console.warn(`Skipped section ${section.name}: ${e.message}`);
        }
      }

      // Test card expand
      const firstCard = page.locator('[data-card]').first();
      await firstCard.locator('.card__head').click();
      await page.waitForTimeout(500);
      const cardPath = path.join(outDir, 'card-expanded.png');
      await firstCard.screenshot({ path: cardPath });
      console.log(`Saved: ${cardPath}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('\nAll screenshots saved to /screenshots/');
})();
