const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium, webkit } = require(process.env.ONEPREVIEW_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.ONEPREVIEW_SITE_URL || 'http://127.0.0.1:8765';
const output = process.env.ONEPREVIEW_SITE_QA_DIR || '/tmp/onepreview-site-qa';
const locales = ['', 'zh-Hans', 'zh-Hant', 'de', 'fr', 'hi', 'id', 'ja', 'ko', 'ru', 'es-MX'];
const selectedBrowsers = (process.env.ONEPREVIEW_SITE_BROWSERS || 'chromium,webkit').split(',');
assert.ok(selectedBrowsers.every(name => ['chromium', 'webkit'].includes(name)), 'Unsupported browser');

(async () => {
  await fs.mkdir(output, { recursive: true });
  for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
    if (!selectedBrowsers.includes(name)) continue;
    const browser = await engine.launch({ headless: true });
    try {
      const errors = [];
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      for (const [variant, width, height, colorScheme] of [['desktop', 1440, 1050, 'light'], ['desktop-dark', 1440, 1050, 'dark'], ['tablet', 768, 1024, 'light'], ['mobile', 390, 844, 'light'], ['mobile-dark', 390, 844, 'dark'], ['compact', 320, 740, 'light']]) {
        await page.setViewportSize({ width, height });
        await page.emulateMedia({ colorScheme });
        for (const locale of locales) {
          for (const type of ['index', 'help', 'support', 'privacy-policy']) {
            const route = (locale ? '/' + locale : '') + (type === 'index' ? '/' : '/' + type);
            const response = await page.goto(base + route);
            assert.equal(response.status(), 200, route);
            assert.ok((await page.title()).includes('OnePreview'));
            assert.equal(await page.locator('h1').count(), 1);
            assert.equal(await page.locator('.nav a.active').count(), 1);
            assert.equal(await page.locator('.skip-link[href="#main-content"]').count(), 1);
            assert.equal(await page.locator('main#main-content').count(), 1);
            const toolRoute = (locale ? '/' + locale : '') + '/tools/markdown-to-pdf/';
            assert.equal(await page.locator(`.nav a[href="${toolRoute}"]`).count(), 1);
            const state = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth,
              images: [...document.images].every(i => i.complete && i.naturalWidth > 0),
              headingWeight: Number(getComputedStyle(document.querySelector('h1')).fontWeight) }));
            assert.ok(state.width <= state.viewport + 1, route + ' overflows horizontally');
            assert.ok(state.images, route + ' has missing images');
            assert.ok(state.headingWeight <= 700, route + ' has excessive headline weight');
            const smallTargets = await page.locator('.nav > a, .language-switch select, .actions > .button').evaluateAll(nodes => nodes.filter(n => n.getBoundingClientRect().height < 43).map(n => n.textContent));
            assert.deepEqual(smallTargets, [], route + ' has undersized navigation or action targets');
            if (width <= 560) {
              const header = await page.evaluate(() => ({ brand: document.querySelector('.brand').getBoundingClientRect().right, language: document.querySelector('.language-switch').getBoundingClientRect().left }));
              assert.ok(header.brand <= header.language, route + ' brand overlaps language selector');
            }
            assert.ok(await page.locator('a[href="https://apps.apple.com/app/id6760284919"]').count());
            assert.equal(await page.locator('a[href*=".dmg"]').count(), 0);
            if (type === 'index') {
              assert.equal(await page.locator('.app-screenshot').getAttribute('src'), `/images/previews/${locale || 'en'}.png?v=1.4.7-153`);
              assert.ok((await page.locator('.preview-caption').innerText()).includes('1.4.7'));
              assert.ok((await page.locator('.app-screenshot').getAttribute('alt')).length > 10);
              assert.equal(await page.locator('.window-bar').count(), 0, 'Do not recreate native app chrome');
              assert.equal(await page.locator('.feature-mark').count(), 4);
            }
            if (['', 'zh-Hans'].includes(locale) && ['index', 'help', 'support'].includes(type)) {
              await page.screenshot({ path: path.join(output, `${name}-${variant}-${locale || 'en'}-${type}.png`), fullPage: true });
              if (type === 'index') await page.screenshot({ path: path.join(output, `${name}-${variant}-${locale || 'en'}-fold.png`), fullPage: false });
            }
          }
        }
        console.log(`${name} ${variant}: 44 localized pages, layout and navigation checks passed`);
      }
      await page.goto(base + '/');
      await page.locator('[data-workflow="mac-editor"] a').click();
      await page.waitForURL('**/help#mac-open-with');
      assert.equal(await page.locator('#mac-open-with').isVisible(), true);
      await page.goto(base + '/help');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.skip-link').evaluate(n => n === document.activeElement), true);
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('main').evaluate(n => n === document.activeElement), true);
      await page.locator('.language-switch select').selectOption('/zh-Hans/help');
      await page.waitForURL('**/zh-Hans/help');
      assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hans');
      await page.locator('.nav a[href="/zh-Hans/"]').click();
      await page.waitForURL('**/zh-Hans/');
      assert.equal(await page.locator('.document-example').count(), 1);
      await page.locator('.hero a[href="/zh-Hans/tools/markdown-to-pdf/"]').click();
      await page.waitForFunction(() => !document.querySelector('#print-report').disabled);
      assert.ok((await page.locator('#report-status').innerText()).includes('A4'));
      assert.deepEqual(errors, []);
      console.log(`${name}: language selection, page navigation and tool entry passed`);
    } finally { await browser.close(); }
  }
})().catch(error => { console.error(error); process.exit(1); });
