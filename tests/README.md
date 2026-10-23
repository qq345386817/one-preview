# Website UI checks

Serve the repository with a static server that resolves extensionless HTML routes,
then run `node tests/ui-smoke.cjs` with Playwright installed for development.
`ONEPREVIEW_PLAYWRIGHT_MODULE` can point to an existing Playwright module.
`ONEPREVIEW_SITE_URL` defaults to `http://127.0.0.1:8765` and screenshots are written
outside the repository to `ONEPREVIEW_SITE_QA_DIR` (default `/tmp/onepreview-site-qa`).

The suite checks all 44 localized landing/help/support/privacy pages in Chromium
and WebKit, 1440/768/390/320px viewports, light and dark themes, image loading,
headline hierarchy, long-word overflow, keyboard skip links, 44px action targets,
language selection, navigation and the PDF tool entry. All 11 languages, including
es-MX, are required. Each landing page uses its original localized App screenshot;
no mock native window is substituted. Use `ONEPREVIEW_SITE_BROWSERS=chromium`
explicitly when the WebKit executable is unavailable; this is not a Safari pass.
The PDF tool's document conversion regression remains in the native repository's
`scripts/markdown_report_web_smoke.mjs`.

Run `node tests/tool-localization-smoke.cjs` against the same server to check all
11 tool routes in Chromium and WebKit, desktop/mobile/light/dark layouts, static
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

Run `node tests/seo-check.cjs` without extra dependencies to audit all 55 public
pages, canonical and language alternates, sitemap coverage, App/WebApplication
separation, localized tool capabilities and FAQ, internal links and the concise
`llms.txt` guide. This checks source consistency, not search-engine indexing or
guaranteed AI citations. The existing crawler access policy is unchanged.

Run `node tests/design-check.cjs` to verify the website's two-theme text contrast,
all 11 full-window PNGs and their language mapping, format coverage, keyboard skip
links, local dependencies and stylesheet cache version. This is a source regression
test, not the separate `design_check` or `design_system_check` artifact validator.
The redesign's canvas, tokens, reference manual and test outputs stay local; only
the production HTML/CSS, original product images and reusable tests are published.
