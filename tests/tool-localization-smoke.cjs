const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium, webkit } = require(process.env.ONEPREVIEW_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.ONEPREVIEW_SITE_URL || 'http://127.0.0.1:8765';
const output = process.env.ONEPREVIEW_SITE_QA_DIR || '/tmp/onepreview-site-qa';
const locales = ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'de', 'fr', 'hi', 'id', 'ru'];
const root = locale => locale === 'en' ? '/' : `/${locale}/`;
const route = locale => root(locale) + 'tools/markdown-to-pdf/';
const origin = 'https://one-preview.luopeike.com';
const expectedAlternates = Object.fromEntries([...locales.map(l => [l, origin + route(l)]), ['x-default', origin + route('en')]]);
const ready = page => page.waitForFunction(() => !document.querySelector('#print-report').disabled);
const statusIs = (page, text) => page.waitForFunction(text => document.querySelector('#report-status').textContent === text, text);

(async () => {
  await fs.mkdir(output, { recursive: true });
  for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
    const browser = await engine.launch({ headless: true });
    try {
      const errors = [];
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.setDefaultTimeout(45000);
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      for (const [variant, width, height, colorScheme] of [['desktop', 1440, 1050, 'light'], ['mobile', 390, 844, 'light'], ['mobile-dark', 390, 844, 'dark']]) {
        await page.setViewportSize({ width, height });
        await page.emulateMedia({ colorScheme });
        for (const locale of locales) {
          const response = await page.goto(base + route(locale));
          assert.equal(response.status(), 200);
          await ready(page);
          assert.ok((await page.title()).includes('OnePreview'));
          assert.equal(await page.locator('html').getAttribute('lang'), locale);
          assert.equal(await page.locator('h1').count(), 1);
          const words = await page.locator('#tool-messages').evaluate(e => JSON.parse(e.textContent));
          assert.deepEqual(Object.keys(words).sort(), ['ready', 'changed', 'working', 'images', 'duplicates', 'imageSize', 'unsupported', 'read', 'encoding', 'errors', 'labels', 'print'].sort());
          assert.deepEqual(Object.keys(words.errors).sort(), ['empty', 'size', 'pages', 'row', 'block', 'width', 'fonts', 'resources'].sort());
          assert.equal((words.labels.page.match(/%d/g) || []).length, 2);
          assert.ok(words.ready.includes('{count}') && words.images.includes('{count}'));
          assert.ok(Object.values(words.errors).every(text => text.length > 5));
          const alternates = await page.locator('link[hreflang]').evaluateAll(nodes => Object.fromEntries(nodes.map(n => [n.hreflang, n.href])));
          assert.deepEqual(alternates, expectedAlternates);
          assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), origin + route(locale));
          const schema = await page.locator('script[type="application/ld+json"]:not([data-seo])').evaluate(e => JSON.parse(e.textContent));
          assert.equal(schema.inLanguage, locale);
          assert.equal(schema.url, origin + route(locale));
          assert.ok(schema.description.length > 30);
          assert.equal(await page.locator('.language-switch option').count(), 10);
          assert.equal(await page.locator('.language-switch select').inputValue(), route(locale));
          for (const suffix of ['', 'help', 'support', 'privacy-policy']) {
            assert.ok(await page.locator(`a[href="${root(locale) + suffix}"]`).count());
          }
          const source = await page.locator('#markdown-source').inputValue();
          const title = source.split('\n')[0].slice(2);
          const frame = page.frames().find(f => /\/report(?:\.html)?$/.test(f.url()));
          assert.equal(await frame.locator('html').getAttribute('lang'), locale);
          assert.equal(await frame.title(), title);
          assert.equal(await frame.locator('.report-diagram svg').count(), 1);
          assert.ok(await frame.locator('.katex').count() >= 2);
          assert.equal(await page.locator('#report-notices li').count(), 0);
          assert.ok((await frame.locator('#report').innerText()).includes(title));
          const count = await frame.locator('.report-page-number').count();
          assert.equal(await page.locator('#report-status').innerText(), words.ready.replace('{count}', count));
          assert.equal(await frame.locator('.report-page-number').first().innerText(), words.labels.page.replace('%d', 1).replace('%d', count));
          const geometry = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1,
            images: [...document.images].every(i => i.complete && i.naturalWidth > 0) }));
          assert.equal(geometry.overflow, false, `${name} ${variant} ${locale} overflow`);
          assert.equal(geometry.images, true);
          await page.screenshot({ path: path.join(output, `tool-${name}-${variant}-${locale}.png`), fullPage: true });

          if (variant === 'desktop') {
            await page.locator('#markdown-source').fill('');
            assert.equal(await page.locator('#report-status').innerText(), words.changed);
            assert.ok(await page.locator('#print-report').isDisabled());
            await page.locator('#render-report').click();
            await statusIs(page, words.errors.empty);
            await page.locator('#markdown-file').setInputFiles({ name: 'invalid.md', mimeType: 'text/markdown', buffer: Buffer.from([0xc3, 0x28]) });
            await statusIs(page, words.encoding);
            await page.locator('#markdown-file').setInputFiles({ name: 'unsupported.txt', mimeType: 'text/plain', buffer: Buffer.from('test') });
            await statusIs(page, words.unsupported);
            await page.locator('#markdown-file').setInputFiles({ name: 'utf16.md', mimeType: 'text/markdown', buffer: Buffer.from(`\ufeff# ${title}\n\n![image](chart.png)`, 'utf16le') });
            await ready(page);
            assert.ok((await page.locator('#report-notices').innerText()).includes(words.labels.image));
            await page.locator('#image-files').setInputFiles({ name: 'chart.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') });
            await ready(page);
            assert.equal(await page.locator('#asset-count').innerText(), words.images.replace('{count}', 1));
            assert.equal(await page.locator('#report-notices li').count(), 0);
            await frame.evaluate(() => { window.print = () => { window.printRequested = true; }; });
            await page.locator('#print-report').click();
            assert.equal(await frame.evaluate(() => window.printRequested), true);
            assert.equal(await page.locator('#print-help').innerText(), words.print);
            await page.locator('#clear-images').click();
            assert.ok(await page.locator('#print-report').isDisabled());
            // Check the tool's localized handling of every renderer error code.
            await frame.evaluate(() => { window.originalRender = window.OnePreviewReport.render; });
            for (const code of Object.keys(words.errors)) {
              await frame.evaluate(code => { window.OnePreviewReport.render = async () => { throw { code }; }; }, code);
              await page.locator('#render-report').click();
              await statusIs(page, words.errors[code]);
              assert.ok(await page.locator('#print-report').isDisabled());
            }
            await frame.evaluate(() => { window.OnePreviewReport.render = window.originalRender; });
            await page.locator('#load-sample').click();
            await ready(page);
            assert.equal(await page.locator('#markdown-source').inputValue(), source);
          }
        }
        console.log(`${name} ${variant}: all 10 tool languages passed`);
      }
      // The selector must navigate to the same tool, not to the site's home page.
      for (const locale of locales) {
        await page.locator('.language-switch select').selectOption(route(locale));
        await page.waitForURL(base + route(locale));
        await ready(page);
        assert.equal(await page.locator('html').getAttribute('lang'), locale);
        await page.goto(base + root(locale));
        await page.locator(`.hero a[href="${route(locale)}"]`).click();
        await ready(page);
      }
      const sitemap = await (await context.request.get(base + '/sitemap.xml')).text();
      for (const locale of locales) {
        assert.equal(sitemap.split(`<loc>${origin}${route(locale)}</loc>`).length, 2);
      }
      assert.deepEqual(errors, [], 'Browser errors');
      console.log(`${name}: translated errors, file/image input, print handoff, selectors, home entries and sitemap passed`);
    } finally { await browser.close(); }
  }
})().catch(error => { console.error(error); process.exit(1); });
