const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium, webkit } = require(process.env.ONEPREVIEW_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.ONEPREVIEW_SITE_URL || 'http://127.0.0.1:8765';
const output = process.env.ONEPREVIEW_SITE_QA_DIR || '/tmp/onepreview-site-qa';
const locales = ['', 'zh-Hans', 'zh-Hant', 'de', 'fr', 'hi', 'id', 'ja', 'ko', 'ru', 'es-MX', 'ar'];
const selectedBrowsers = (process.env.ONEPREVIEW_SITE_BROWSERS || 'chromium,webkit').split(',');
assert.ok(selectedBrowsers.every(name => ['chromium', 'webkit'].includes(name)), 'Unsupported browser');

(async () => {
  await fs.mkdir(output, { recursive: true });
  const previews = JSON.parse(await fs.readFile(path.join(__dirname, '../images/previews/manifest.json'), 'utf8'));
  const previewRevision = [previews.version, previews.build, previews.revision].filter(Boolean).join('-');
  for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
    if (!selectedBrowsers.includes(name)) continue;
    const browser = await engine.launch({ headless: true, ...(name === 'chromium' && process.env.ONEPREVIEW_SITE_CHROMIUM_CHANNEL ? { channel: process.env.ONEPREVIEW_SITE_CHROMIUM_CHANNEL } : {}) });
    try {
      const errors = [];
      const knownWarnings = new Set();
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', message => {
        const text = message.text();
        if (message.type() === 'warning' && page.url().includes('/tools/markdown-to-pdf/') &&
            text === 'An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing.') {
          // Existing same-origin renderer bridge; retain sandbox, sanitization and CSP.
          knownWarnings.add(text);
        } else if (['error', 'warning'].includes(message.type())) errors.push(text);
      });
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
            assert.ok((await page.locator('main').innerText()).trim().length > 30, route + ' is blank');
            assert.equal(await page.locator('vite-error-overlay, nextjs-portal').count(), 0);
            assert.equal(await page.locator('.nav a.active').count(), 1);
            assert.equal(await page.locator('.skip-link[href="#main-content"]').count(), 1);
            assert.equal(await page.locator('main#main-content').count(), 1);
            assert.equal(await page.locator('.footer-languages a').count(), 12);
            assert.equal(await page.locator('.footer-languages a[aria-current="page"]').count(), 1);
            const toolRoute = (locale ? '/' + locale : '') + '/tools/markdown-to-pdf/';
            assert.equal(await page.locator(`.nav a[href="${toolRoute}"]`).count(), 1);
            const state = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth,
              images: [...document.images].every(i => i.complete && i.naturalWidth > 0),
              headingWeight: Number(getComputedStyle(document.querySelector('h1')).fontWeight) }));
            assert.ok(state.width <= state.viewport + 1, route + ' overflows horizontally');
            assert.ok(state.images, route + ' has missing images');
            assert.ok(state.headingWeight <= 700, route + ' has excessive headline weight');
            const smallTargets = await page.locator('.nav > a, .language-switch select, .actions > .button, .footer-languages a').evaluateAll(nodes => nodes.filter(n => n.getBoundingClientRect().height < 43).map(n => n.textContent));
            assert.deepEqual(smallTargets, [], route + ' has undersized navigation or action targets');
            if (width <= 560) {
              const header = await page.evaluate(() => {
                const brand = document.querySelector('.brand').getBoundingClientRect();
                const language = document.querySelector('.language-switch').getBoundingClientRect();
                return { separated: document.dir === 'rtl' ? language.right <= brand.left : brand.right <= language.left };
              });
              assert.ok(header.separated, route + ' brand overlaps language selector');
            }
            assert.ok(await page.locator('a[href="https://apps.apple.com/app/id6760284919"]').count());
            assert.equal(await page.locator('a[href*=".dmg"]').count(), 0);
            if (type === 'index') {
              const studio = await page.locator('.hero-art img').evaluate(img => new URL(img.currentSrc).pathname);
              assert.equal(studio.includes('folder-studio-dark'), colorScheme === 'dark', route + ' should match the system appearance');
              assert.equal(await page.locator('.app-screenshot').getAttribute('src'), `/images/previews/${locale || 'en'}.png?v=${previewRevision}`);
              assert.ok((await page.locator('.preview-caption').innerText()).includes(previews.version));
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
        console.log(`${name} ${variant}: 48 localized pages, layout and navigation checks passed`);
      }
      for (const locale of locales) {
        const root = locale ? '/' + locale + '/' : '/';
        await page.goto(base + root);
        await page.locator('.demo-jump').click();
        await page.waitForURL(base + root + '#file-demo');
        const desk = page.locator('.sample-desk');
        for (const sample of ['json', 'csv', 'md']) {
          await desk.locator('.sample-files label').filter({ has: page.locator('input[value="' + sample + '"]') }).click();
          const selected = desk.locator('.sample-page:visible');
          assert.equal(await selected.count(), 1);
          assert.equal(await selected.getAttribute('data-file'), sample);
          const preview = selected.locator('.rendered');
          assert.ok(await preview.isVisible());
          if (sample === 'csv') assert.equal(await preview.locator('tbody tr').count(), 3);
          if (sample === 'md') assert.equal(await preview.locator('.trail li').count(), 3);
          await desk.locator('.view-switch label').last().click();
          const raw = selected.locator('.source');
          assert.ok(await raw.isVisible());
          assert.ok((await raw.innerText()).includes({ md: 'flowchart LR', json: '"river-trail"', csv: '11.8' }[sample]));
          await desk.locator('.sample-paper').focus();
          await page.keyboard.press('Space');
          assert.ok(await preview.isVisible());
        }
        const detail = page.locator('#folder-reading details').first();
        await detail.locator('summary').click();
        assert.ok(await detail.locator('p').isVisible());
      }
      console.log(name + ': all 12 interactive home demos, keyboard shortcuts and chapter disclosures passed');
      await page.goto(base + '/');
      for (const locale of ['', 'zh-Hans', 'ar']) {
        const root = locale ? `/${locale}/` : '/';
        for (const id of ['read-markdown-folder', 'export-folder-pdf']) {
          await page.goto(base + root);
          await page.locator(`#folder-reading a[href="${root}help#${id}"]`).click();
          await page.waitForURL(base + root + 'help#' + id);
          assert.equal(await page.locator(`article#${id}`).isVisible(), true);
        }
      }
      await page.goto(base + '/');
      await page.locator('#native-markdown-pdf a').click();
      await page.waitForURL('**/help#markdown-report-pdf');
      assert.ok((await page.locator('#markdown-report-pdf').innerText()).includes('.markdown'));
      await page.goto(base + '/');
      await page.locator('[data-workflow="mac-editor"] a').click();
      await page.waitForURL('**/help#mac-open-with');
      assert.equal(await page.locator('#mac-open-with').isVisible(), true);
      await page.goto(base + '/help');
      // macOS WebKit uses Option-Tab to include links with the default keyboard settings.
      await page.keyboard.press(name === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');
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
      await page.waitForURL('**/zh-Hans/tools/markdown-to-pdf/');
      await page.locator('#print-report:enabled').waitFor();
      assert.ok((await page.locator('#report-status').innerText()).includes('A4'));
      assert.deepEqual(errors, []);
      if (knownWarnings.size) console.log(`${name}: known renderer sandbox warnings: ${JSON.stringify([...knownWarnings])}`);
      console.log(`${name}: language selection, page navigation and tool entry passed`);
      const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
      try {
        const staticPage = await staticContext.newPage();
        await staticPage.goto(base + '/');
        await staticPage.locator('.footer-languages a[hreflang="zh-Hans"]').click();
        await staticPage.waitForURL('**/zh-Hans/');
        assert.equal(await staticPage.locator('html').getAttribute('lang'), 'zh-Hans');
        await staticPage.locator('.sample-files label').last().click();
        assert.equal(await staticPage.locator('[data-file="csv"] table:visible tbody tr').count(), 3);
        await staticPage.locator('.view-switch label').last().click();
        assert.ok((await staticPage.locator('[data-file="csv"] .source:visible').innerText()).includes('11.8'));
        await staticPage.goto(base + '/zh-Hans/help');
        await staticPage.locator('.footer-languages a[hreflang="en"]').click();
        await staticPage.waitForURL('**/help');
        assert.equal(await staticPage.locator('html').getAttribute('lang'), 'en');
        await staticPage.locator('.footer-languages').scrollIntoViewIfNeeded();
        await staticPage.screenshot({ path: path.join(output, `${name}-no-js-mobile-footer.png`) });
        console.log(`${name}: canonical footer language navigation passed with JavaScript disabled`);
      } finally { await staticContext.close(); }
    } finally { await browser.close(); }
  }
})().catch(error => { console.error(error); process.exit(1); });
