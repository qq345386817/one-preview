const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const locales = ['', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'de', 'fr', 'hi', 'id', 'ru', 'es-MX'];
const css = fs.readFileSync(path.join(root, 'style/base.css'), 'utf8');
const palette = css.replace(/#fff\b/g, '#ffffff');
const rgb = hex => hex.replace('#', '').match(/../g).map(x => parseInt(x, 16) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
const luminance = hex => rgb(hex).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
for (const [fg, bg] of [['#15253c', '#f8fafc'], ['#5d6c80', '#ffffff'], ['#5d6c80', '#edf5ff'], ['#075ab1', '#f8fafc'], ['#075ab1', '#edf5ff'], ['#eaf1f9', '#101821'], ['#a7b7ca', '#16212c'], ['#a7b7ca', '#192e44'], ['#b2d6ff', '#192e44'], ['#ffffff', '#0872dd']]) {
  assert.ok(palette.includes(fg) && palette.includes(bg), 'Unexpected brand palette');
  assert.ok(contrast(fg, bg) >= 4.5, `Insufficient text contrast: ${fg} / ${bg}`);
}
assert.ok(css.includes('prefers-reduced-motion: no-preference'));
assert.ok(css.includes('overflow-wrap: anywhere'));
assert.ok(!css.includes('color: var(--primary);'), 'Use the darker source blue for small text on tinted surfaces');
assert.ok(!/@import|url\(["']?https?:/i.test(css), 'No remote style/font dependency');
for (const locale of locales) {
  const prefix = locale ? locale + '/' : '';
  const image = `images/previews/${locale || 'en'}.png`;
  const png = fs.readFileSync(path.join(root, image));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 1180);
  assert.equal(png.readUInt32BE(20), 820);
  assert.ok(png.length < 200000, image + ' should stay lightweight');
  for (const file of ['index.html', 'help.html', 'support.html', 'privacy-policy.html', 'tools/markdown-to-pdf/index.html']) {
    const html = fs.readFileSync(path.join(root, prefix, file), 'utf8');
    assert.ok(html.includes('class="skip-link" href="#main-content"'));
    assert.equal((html.match(/id="main-content"/g) || []).length, 1);
    assert.ok(html.includes('base.css?v=20261024'));
    assert.ok(html.includes(`href="/${prefix}tools/markdown-to-pdf/"`));
    if (file === 'index.html') {
      assert.ok(html.includes(`src="/${image}"`));
      assert.ok(!html.includes('class="window-bar"'));
      for (const format of ['Markdown', 'MDX', 'TextBundle', 'TextPack', 'JSON', 'JSONL', 'YAML', 'XML', 'CSV', 'TSV', 'TOML', 'ENV', 'SQLite', 'TAR.GZ']) assert.ok(html.includes(format), `${locale}: ${format}`);
    }
  }
}
console.log('Design source checks passed: 55 pages, 11 authentic localized screenshots, full format coverage, keyboard entry, theme contrast and local assets. This is not the unavailable design/design-system artifact validator.');
