const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const site = path.resolve(__dirname, '..');
const origin = 'https://one-preview.luopeike.com';
const locales = ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'de', 'fr', 'hi', 'id', 'ru', 'es-MX', 'ar'];
const prefix = locale => locale === 'en' ? '/' : `/${locale}/`;
const pageTypes = ['', 'help', 'support', 'privacy-policy', 'tools/markdown-to-pdf/'];
const sitemap = fs.readFileSync(path.join(site, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const sitemapEntries = new Map([...sitemap.matchAll(/<url>\s*<loc>(.*?)<\/loc>([\s\S]*?)<\/url>/g)]
  .map(([, url, body]) => [url, body]));
const llms = fs.readFileSync(path.join(site, 'llms.txt'), 'utf8');
const localFile = route => {
  const location = path.join(site, route);
  if (fs.existsSync(location) && fs.statSync(location).isDirectory()) return path.join(location, 'index.html');
  return fs.existsSync(location) ? location : location + '.html';
};
const jsonScripts = html => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)].map(match => JSON.parse(match[1]));
const decode = text => text.replaceAll('&quot;', '"').replaceAll('&#x27;', "'")
  .replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&amp;', '&');

function verifyVisibleAnswer(html, faq, id) {
  const visible = html.match(new RegExp(`<article class="faq-item" id="${id}"><h2>(.*?)</h2><p>(.*?)</p></article>`));
  assert.ok(visible, `Help article missing: ${id}`);
  const question = faq.mainEntity.find(item => item.name === decode(visible[1]));
  assert.ok(question, `FAQ question missing: ${id}`);
  assert.equal(decode(visible[2]), question.acceptedAnswer.text);
  return question.acceptedAnswer.text;
}

assert.equal(urls.length, 60);
assert.equal(new Set(urls).size, 60);
assert.ok(llms.startsWith('# OnePreview\n\n> '));
assert.ok(Buffer.byteLength(llms) < 10000, 'The content guide should remain concise');
assert.ok(llms.includes('does not replace the built-in Files Quick Look'));
assert.ok(llms.includes('MDX components, custom scripts, TextBundle and TextPack are not supported'));
assert.ok(llms.includes('Hindi/Devanagari'));
assert.ok(llms.includes('standard .md and .markdown documents can also be exported as A4 PDF reports'));
assert.ok(llms.includes('not inside Finder Quick Look or the built-in Files preview'));
assert.ok(llms.includes('do not claim every file is cached, a fixed speedup'));
assert.ok(llms.includes('Quick Look reads those saved choices and also supports temporary choices'));
assert.ok(llms.includes('not macOS default file associations'));
assert.ok(llms.includes('not an iOS editor-preference feature'));
for (const term of ['authorized folder', 'current folder session', 'up to 20 selected .md or .markdown', '100 pages and 64 MiB']) {
  assert.ok(llms.includes(term), `Missing folder workflow detail: ${term}`);
}
const guideLinks = [...llms.matchAll(/\[[^\]]+\]\((https:\/\/[^)]+)\)/g)].map(match => match[1]);
for (const link of guideLinks.filter(link => link.startsWith(origin + '/'))) {
  assert.ok(fs.existsSync(localFile(new URL(link).pathname)), 'Missing llms.txt destination: ' + link);
}

for (const locale of locales) {
  const root = prefix(locale);
  const toolUrl = origin + root + 'tools/markdown-to-pdf/';
  assert.ok(guideLinks.includes(origin + root));
  assert.ok(guideLinks.includes(toolUrl));
  for (const type of pageTypes) {
    const route = root + type;
    const html = fs.readFileSync(localFile(route), 'utf8');
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
    assert.ok(title.includes('OnePreview'));
    assert.ok(description.length > 30);
    assert.equal(html.match(/<meta property="og:description" content="([^"]+)"/)[1], description);
    assert.equal(html.match(/<meta name="twitter:description" content="([^"]+)"/)[1], description);
    if (type === '' || type === 'help') {
      assert.equal(html.match(/<meta property="og:title" content="([^"]+)"/)[1], title);
      assert.equal(html.match(/<meta name="twitter:title" content="([^"]+)"/)[1], title);
    }
    if (locale === 'zh-Hans' && type === 'help') assert.ok([...description].length >= 150 && [...description].length <= 160, 'Keep the reported help-page snippet informative');
    for (const image of html.matchAll(/<img\b[^>]*>/g)) {
      assert.ok(/\balt="[^"]+"/.test(image[0]), route + ': missing descriptive image alt');
      if (/app-store-icon\.svg|favicon\/apple-touch-icon\.png/.test(image[0])) assert.ok(image[0].includes('aria-hidden="true"'), 'Decorative brand icons must not duplicate the link label');
    }
    assert.match(html, new RegExp(`<html lang="${locale}"`));
    assert.ok(html.includes(`rel="canonical" href="${origin + route}"`));
    assert.ok(urls.includes(origin + route));
    assert.ok(html.includes('rel="describedby" type="text/plain" href="/llms.txt"'));
    const languages = html.match(/<nav class="footer-languages"[^>]*>(.*?)<\/nav>/)?.[1];
    assert.ok(languages, `${route}: crawlable language navigation missing`);
    for (const target of locales) {
      assert.ok(languages.includes(`href="${prefix(target) + type}"`), `${route}: missing ${target} body link`);
    }
    assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) || []).length, 1);
    assert.ok(!html.includes('name="keywords"'), 'Do not add ineffective meta keyword lists');
    assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html));
    const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    const sitemapAlternates = [...sitemapEntries.get(origin + route)
      .matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    assert.equal(alternates.length, locales.length + 1);
    assert.equal(sitemapAlternates.length, alternates.length, `${route}: incomplete sitemap alternates`);
    for (const target of [...locales, 'x-default']) {
      const expected = origin + prefix(target === 'x-default' ? 'en' : target) + type;
      assert.ok(alternates.some(m => m[1] === target && m[2] === expected));
      assert.ok(sitemapAlternates.some(m => m[1] === target && m[2] === expected), `${route}: missing ${target} in sitemap`);
    }
    const schemas = jsonScripts(html);
    if (type === '' || type === 'help') {
      assert.ok(schemas.find(s => s['@type'] === 'SoftwareApplication').featureList.includes(locale === 'ar' ? 'المحرّرات المفضّلة وفتح باستخدام على macOS' : 'Preferred editors and Open With on macOS'));
      const app = schemas.find(s => s['@type'] === 'SoftwareApplication');
      assert.equal(app.inLanguage, locale);
      for (const format of ['NDJSON', 'INI', 'properties', 'TGZ']) assert.ok(html.includes(format), `${route}: ${format}`);
      assert.ok(app.featureList.some(value => value.includes('PDF')), `${route}: native PDF export`);
    }
    if (type === '') {
      assert.equal((html.match(/data-workflow="mac-editor"/g) || []).length, 1);
      assert.ok(html.includes(`href="${root}help#mac-open-with"`));
      assert.ok(html.includes('id="markdown-pdf"'));
      assert.ok(html.includes('id="native-markdown-pdf"'));
      assert.ok(html.includes(`href="${root}help#markdown-report-pdf"`));
      const folder = html.match(/<section class="section" id="folder-reading">([\s\S]*?)<\/section>/)?.[1];
      assert.ok(folder, `${route}: folder-reading section missing`);
      for (const id of ['read-markdown-folder', 'export-folder-pdf']) {
        assert.ok(folder.includes(`href="${root}help#${id}"`), `${route}: missing ${id} guide link`);
      }
      const cards = [...folder.matchAll(/<details class="feature"><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)];
      assert.equal(cards.length, 3);
      assert.ok(cards.some(([, , copy]) => ['20', '.md', '.markdown'].every(term => copy.includes(term))));
      assert.ok(html.includes('class="feature-grid two"'));
      assert.ok(description.includes('PDF'));
      const native = schemas.find(s => s['@type'] === 'SoftwareApplication');
      assert.equal(native.description, decode(html.match(/<p class="lead">(.*?)<\/p>/)[1]));
      for (const [, heading] of cards) {
        assert.ok(native.featureList.includes(decode(heading)), `${route}: feature differs from visible copy`);
      }
      assert.equal(native.operatingSystem, 'macOS, iOS, iPadOS');
      assert.equal(native.downloadUrl, 'https://apps.apple.com/app/id6760284919');
      const website = schemas.find(s => s['@type'] === 'WebSite');
      assert.equal(website.description, description.replaceAll('&amp;', '&'));
      assert.equal(website.hasPart[0]['@type'], 'WebApplication');
      assert.equal(website.hasPart[0]['@id'], toolUrl + '#application');
    }
    if (type === 'help') {
      const faq = schemas.find(s => s['@type'] === 'FAQPage');
      assert.equal(faq.mainEntity.length, 10);
      assert.ok(verifyVisibleAnswer(html, faq, 'markdown-report-pdf').includes('.markdown'));
      const editor = verifyVisibleAnswer(html, faq, 'mac-open-with');
      assert.ok(editor.includes('macOS') && editor.includes('iPhone'));
      verifyVisibleAnswer(html, faq, 'read-markdown-folder');
      const folderPDF = verifyVisibleAnswer(html, faq, 'export-folder-pdf');
      for (const term of ['20', '.md', '.markdown', 'A4', '100', '64 MiB']) assert.ok(folderPDF.includes(term));
    }
    if (type === 'tools/markdown-to-pdf/') {
      assert.ok(title.includes('Markdown') && title.includes('PDF'));
      assert.equal((html.match(/class="tool-guide"/g) || []).length, 6);
      for (const term of ['Mermaid', 'KaTeX', '500', '100', '16', '20']) assert.ok(html.includes(term));
      const application = schemas.find(s => s['@type'] === 'WebApplication');
      assert.equal(application['@id'], toolUrl + '#application');
      assert.equal(application.description, description.replaceAll('&amp;', '&'));
      assert.equal(application.inLanguage, locale);
      assert.equal(application.isAccessibleForFree, true);
      assert.equal(application.offers.price, '0');
      assert.equal(application.featureList.length, 5);
      const breadcrumb = schemas.find(s => s['@type'] === 'BreadcrumbList');
      assert.equal(breadcrumb.itemListElement.length, 2);
      assert.equal(breadcrumb.itemListElement[0].item, origin + root);
      assert.equal(breadcrumb.itemListElement[1].item, toolUrl);
      assert.ok(html.includes('name="twitter:title"'));
      assert.ok(html.includes('property="og:locale"'));
      if (locale === 'hi') assert.ok(html.includes('साझा करने से पहले कॉपी किए गए टेक्स्ट की जाँच करें।'));
    }
    // Validate navigational and download links without installing an HTML parser.
    for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const url = new URL(href, origin + route);
      if (url.origin === origin) assert.ok(fs.existsSync(localFile(url.pathname)), `Broken link ${route} -> ${href}`);
    }
  }
}

assert.equal(fs.readFileSync(path.join(site, 'robots.txt'), 'utf8'), 'User-agent: *\nAllow: /\nSitemap: https://one-preview.luopeike.com/sitemap.xml\n');
const reachable = new Set();
const pending = [origin + '/'];
while (pending.length) {
  const url = pending.shift();
  if (reachable.has(url)) continue;
  reachable.add(url);
  const html = fs.readFileSync(localFile(new URL(url).pathname), 'utf8');
  for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const target = new URL(href.replaceAll('&amp;', '&'), url);
    target.hash = ''; target.search = '';
    if (urls.includes(target.href) && !reachable.has(target.href)) pending.push(target.href);
  }
}
assert.equal(reachable.size, urls.length, 'Every canonical page must be reachable through ordinary HTML links');
console.log('SEO/GEO checks passed: 60 pages, 12 locale pairs, canonical/hreflang/sitemap, product entities, visible FAQ, local links and llms.txt.');
