# Website UI checks

Serve the repository with a static server that resolves extensionless HTML routes,
then run `node tests/ui-smoke.cjs` with Playwright installed for development.
`ONEPREVIEW_PLAYWRIGHT_MODULE` can point to an existing Playwright module.
`ONEPREVIEW_SITE_URL` defaults to `http://127.0.0.1:8765` and screenshots are written
outside the repository to `ONEPREVIEW_SITE_QA_DIR` (default `/tmp/onepreview-site-qa`).

The suite checks all 48 localized landing/help/support/privacy pages in Chromium
and WebKit, 1440/768/390/320px viewports, light and dark themes, image loading,
headline hierarchy, long-word overflow, keyboard skip links, 44px action targets,
language selection, navigation and the PDF tool entry. All 12 languages, including
es-MX and Arabic, are required. Each landing page uses its original localized App screenshot;
no mock native window is substituted. Use `ONEPREVIEW_SITE_BROWSERS=chromium`
explicitly when the WebKit executable is unavailable; this is not a Safari pass.
The PDF tool's document conversion regression remains in the native repository's
`scripts/markdown_report_web_smoke.mjs`.

Run `node tests/tool-localization-smoke.cjs` against the same server to check all
12 tool routes in Chromium and WebKit, desktop/mobile/light/dark layouts, static
SEO alternates and sitemap coverage, translated examples (including Mermaid and
math), localized status/errors/image counts/page footers, file input, print
handoff, stale-preview protection and language-switch navigation. Screenshots
are written to the same external QA directory. System print dialogs and physical
iPhone/iPad PDF sharing are not automated by this suite.

Markdown import is exposed by a keyboard-accessible button in every locale.
The tool shows the imported file name, accepts UTF-8 and BOM-marked UTF-16
`.md`/`.markdown` files up to 500 KB, and keeps the existing text when import fails.
The suite exercises the actual file chooser, oversized/binary input, filename
feedback and resetting that feedback when loading the example.
Use `ONEPREVIEW_SITE_BROWSERS=chromium` to explicitly run just Chromium when the
WebKit runtime is unavailable; this is not a Safari pass. Run
`node tests/markdown-import-smoke.cjs` for reimport, cancellation, stale reads,
import-during-render and localized read-error regression checks.

Run `node tests/seo-check.cjs` without extra dependencies to audit all 60 public
pages, canonical and language alternates, sitemap coverage, App/WebApplication
separation, localized tool capabilities and FAQ, internal links and the concise
`llms.txt` guide. This checks source consistency, not search-engine indexing or
guaranteed AI citations. The existing crawler access policy is unchanged.

The macOS editor workflow links each localized homepage to `help#mac-open-with`.
The UI suite exercises that link. SEO checks require the visible answer and
FAQ structured data to match, scope saved editor choices to macOS, and retain
the distinction from choosing OnePreview in Files on iPhone or iPad. The content
guide documents original-file handoff without changing system associations.

Run `node tests/design-check.cjs` to verify the website's two-theme text contrast,
all 12 full-window PNGs and their language mapping, format coverage, keyboard skip
links, local dependencies and stylesheet cache version. This is a source regression
test, not the separate `design_check` or `design_system_check` artifact validator.
The redesign's canvas, tokens, reference manual and test outputs stay local; only
the production HTML/CSS, original product images and reusable tests are published.

The screenshot manifest records real native macOS 1.4.8 (154) verification windows
from the 2026-11-14 local refresh, including image SHA-256 hashes, local source and capture revision;
tests derive cache keys from that manifest instead of hardcoding a release. This
does not mean a new App Store build or website deployment has happened. Home/help
content distinguishes native Markdown import/PDF export from the independent web
tool, and the visible native PDF answer must match its FAQ structured data.
Design checks validate image bytes and versioned image URLs. Each homepage labels
the UI preview version without promising App Store parity. Raw captures and
accessibility evidence stay local.

The same-day Dark Mode follow-up removes the duplicate system capsule in the
native Mac toolbar; the manifest capture revision distinguishes that refresh
without changing the App version. Every public page also has visible, wrapping
language links in its footer, with canonical destinations and a current-language
marker. SEO tests follow ordinary HTML anchors from the English homepage and
require all 60 pages to be reachable. UI checks cover footer link targets and
navigation with JavaScript disabled. This improves discovery; it neither identifies
Google's exact reason for withholding indexing nor guarantees indexing after
deployment. A successful sitemap or live URL test is not an indexed-page result.

When bundled Chromium is unavailable, `ONEPREVIEW_SITE_CHROMIUM_CHANNEL=chrome`
uses an installed Chrome with an isolated headless test profile. Keep
`ONEPREVIEW_SITE_BROWSERS=chromium` explicit; this does not establish a WebKit pass.

## Bing And IndexNow

`node --test tests/indexnow.test.cjs` checks the site-scoped notification helper,
public verification file, canonical URL restrictions, offline default, live-key
gate, response states and non-repeating error handling. The hexadecimal root text
file is public ownership proof, not an account credential; do not add it to the
sitemap or content guide. Its response is marked `noindex`, but crawling remains
allowed so IndexNow can verify it. Never commit Cloudflare tokens or Bing sessions.

After the existing Cloudflare Pages Git deployment is live, preview a submission:

```bash
node script/submit-indexnow.cjs --all
node script/submit-indexnow.cjs --url https://one-preview.luopeike.com/zh-Hans/help
# Initial setup or a reviewed whole-site change only:
node script/submit-indexnow.cjs --all --submit
# For later changes, notify just the affected canonical URLs:
node script/submit-indexnow.cjs --url https://one-preview.luopeike.com/zh-Hans/help --submit
```

The helper verifies the published key before posting to the shared IndexNow
endpoint, preserves the caller's proxy environment, and does not change system
settings. HTTP 200 means received, not indexed; 202 still awaits key validation.
Search reports and historic recommendations can lag behind live fixes. Review
natural, relevant inbound links separately; do not buy or fabricate backlinks.

Run `node tests/arabic-smoke.cjs` for Arabic RTL coverage: all five routes at desktop/mobile/compact-dark sizes, LTR code and math, multi-page direction stability, English document direction independence, PDF creation and ordinary language navigation with JavaScript disabled. Use the same Playwright/server environment variables as the other suites. Arabic reports use the bundled regular/bold OnePreview Arabic faces and license; the metadata records the upstream hashes and combining-mark-only ligature adjustment. Browser print is not the native PDF export pipeline: local Chrome PDFs are NFKC-equivalent but may expose presentation-form Unicode codes in PDFKit extraction. Test-generated PDFs are local evidence, not a guarantee that every browser preserves copied Arabic text identically.
