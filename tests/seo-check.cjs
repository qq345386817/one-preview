const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const site = path.resolve(__dirname, '..');
const origin = 'https://one-preview.luopeike.com';
const locales = ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'de', 'fr', 'hi', 'id', 'ru'];
const prefix = locale => locale === 'en' ? '/' : `/${locale}/`;
const pageTypes = ['', 'help', 'support', 'privacy-policy', 'tools/markdown-to-pdf/'];
const sitemap = fs.readFileSync(path.join(site, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const llms = fs.readFileSync(path.join(site, 'llms.txt'), 'utf8');
const localFile = route => {
  const location = path.join(site, route);
  if (fs.existsSync(location) && fs.statSync(location).isDirectory()) return path.join(location, 'index.html');
  return fs.existsSync(location) ? location : location + '.html';
};
const jsonScripts = html => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)].map(match => JSON.parse(match[1]));

assert.equal(urls.length, 50);
assert.equal(new Set(urls).size, 50);
assert.ok(llms.startsWith('# OnePreview\n\n> '));
assert.ok(Buffer.byteLength(llms) < 10000, 'The content guide should remain concise');
assert.ok(llms.includes('does not replace the built-in Files Quick Look'));
assert.ok(llms.includes('MDX components, custom scripts, TextBundle and TextPack are not supported'));
assert.ok(llms.includes('Hindi/Devanagari'));
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
    assert.match(html, new RegExp(`<html lang="${locale}"`));
    assert.ok(html.includes(`rel="canonical" href="${origin + route}"`));
    assert.ok(urls.includes(origin + route));
    assert.ok(html.includes('rel="describedby" type="text/plain" href="/llms.txt"'));
    assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) || []).length, 1);
    assert.ok(!html.includes('name="keywords"'), 'Do not add ineffective meta keyword lists');
    assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html));
    const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    assert.equal(alternates.length, 11);
    for (const target of [...locales, 'x-default']) {
      assert.ok(alternates.some(m => m[1] === target && m[2] === origin + prefix(target === 'x-default' ? 'en' : target) + type));
    }
    const schemas = jsonScripts(html);
    if (type === '') {
      assert.ok(html.includes('id="markdown-pdf"'));
      assert.ok(html.includes('class="feature-grid two"'));
      assert.ok(description.includes('PDF'));
      const native = schemas.find(s => s['@type'] === 'SoftwareApplication');
      assert.equal(native.operatingSystem, 'macOS, iOS, iPadOS');
      assert.equal(native.downloadUrl, 'https://apps.apple.com/app/id6760284919');
      const website = schemas.find(s => s['@type'] === 'WebSite');
      assert.equal(website.description, description.replaceAll('&amp;', '&'));
      assert.equal(website.hasPart[0]['@type'], 'WebApplication');
      assert.equal(website.hasPart[0]['@id'], toolUrl + '#application');
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
console.log('SEO/GEO checks passed: 50 pages, 10 locale pairs, canonical/hreflang/sitemap, product entities, visible FAQ, local links and llms.txt.');
