const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.ONEPREVIEW_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.ONEPREVIEW_SITE_URL || 'http://127.0.0.1:8765';
const output = process.env.ONEPREVIEW_SITE_QA_DIR || '/tmp/onepreview-arabic-qa';
(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.ONEPREVIEW_SITE_CHROMIUM_CHANNEL ? { channel: process.env.ONEPREVIEW_SITE_CHROMIUM_CHANNEL } : {}) });
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [name, width, height, colorScheme] of [['desktop', 1440, 1050, 'light'], ['mobile', 390, 844, 'light'], ['compact-dark', 320, 740, 'dark']]) {
      await page.setViewportSize({ width, height }); await page.emulateMedia({ colorScheme });
      for (const route of ['/ar/', '/ar/help', '/ar/support', '/ar/privacy-policy', '/ar/tools/markdown-to-pdf/']) {
        assert.equal((await page.goto(base + route)).status(), 200);
        assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
        assert.equal(await page.locator('.footer-languages a[aria-current="page"]').innerText(), 'العربية');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, route);
        if (route.endsWith('markdown-to-pdf/')) {
          await page.waitForFunction(() => !document.querySelector('#print-report').disabled);
          const frame = page.frames().find(f => /\/report(?:\.html)?$/.test(f.url()));
          assert.equal(await frame.locator('.report-page').first().getAttribute('dir'), 'rtl');
          assert.equal(await frame.locator('pre').first().evaluate(e => getComputedStyle(e).direction), 'ltr');
          assert.equal(await frame.locator('.katex').first().evaluate(e => getComputedStyle(e).direction), 'ltr');
        }
        if (route === '/ar/' || route.endsWith('markdown-to-pdf/')) await page.screenshot({ path: path.join(output, `arabic-${name}-${route === '/ar/' ? 'home' : 'tool'}.png`), fullPage: true });
      }
    }
    const report = await context.newPage();
    await report.goto(base + '/script/markdown-report/report.html');
    await report.waitForFunction(() => !!window.OnePreviewReport);
    const long = '# تقرير طويل\n\n```javascript\n' + Array.from({ length: 180 }, (_, i) => `const line${i} = ${i};`).join('\n') + '\n```\n\nنهاية التقرير.';
    const directions = await report.evaluate(async markdown => {
      await window.OnePreviewReport.render(markdown, {});
      return [...document.querySelectorAll('.report-page')].map(e => e.dir);
    }, long);
    assert.ok(directions.length > 1);
    assert.ok(directions.every(dir => dir === 'rtl'), 'Pagination must retain the original content direction after moving its Arabic heading');
    await report.pdf({ path: path.join(output, 'arabic-long-code.pdf'), preferCSSPageSize: true, printBackground: true });
    const source = await fs.readFile(path.join(__dirname, '../ar/tools/markdown-to-pdf/example.md'), 'utf8');
    await report.evaluate(async markdown => { document.documentElement.lang = 'ar'; await window.OnePreviewReport.render(markdown, { labels: { page: 'صفحة %d / %d' } }); }, source);
    await report.pdf({ path: path.join(output, 'arabic-example.pdf'), preferCSSPageSize: true, printBackground: true });
    // UI language does not force English documents into RTL.
    assert.equal(await report.evaluate(async () => { await window.OnePreviewReport.render('# English report\n\nA standard English document.', {}); return document.querySelector('.report-page').dir; }), 'ltr');
    assert.deepEqual(errors, []);
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJS.newPage();
    await staticPage.goto(base + '/help');
    await staticPage.locator('.footer-languages a[hreflang="ar"]').click();
    await staticPage.waitForURL(base + '/ar/help');
    assert.equal(await staticPage.locator('html').getAttribute('dir'), 'rtl');
    await noJS.close();
    console.log(`Arabic RTL browser checks passed: five routes x three layouts, code/math LTR, ${directions.length}-page stable RTL pagination, English content LTR, PDF output and no-JS language navigation.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
