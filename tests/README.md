# Website UI checks

Serve the repository with a static server that resolves extensionless HTML routes,
then run `node tests/ui-smoke.cjs` with Playwright installed for development.
`ONEPREVIEW_PLAYWRIGHT_MODULE` can point to an existing Playwright module.
`ONEPREVIEW_SITE_URL` defaults to `http://127.0.0.1:8765` and screenshots are written
outside the repository to `ONEPREVIEW_SITE_QA_DIR` (default `/tmp/onepreview-site-qa`).

The suite checks all 40 localized landing/help/support/privacy pages in Chromium
and WebKit, desktop and mobile viewports, light and dark themes, image loading,
headline hierarchy, overflow, language selection, navigation and the PDF tool entry.
The PDF tool's document conversion regression remains in the native repository's
`scripts/markdown_report_web_smoke.mjs`.

Run `node tests/tool-localization-smoke.cjs` against the same server to check all
10 tool routes in Chromium and WebKit, desktop/mobile/light/dark layouts, static
SEO alternates and sitemap coverage, translated examples (including Mermaid and
math), localized status/errors/image counts/page footers, file input, print
handoff, stale-preview protection and language-switch navigation. Screenshots
are written to the same external QA directory. System print dialogs and physical
iPhone/iPad PDF sharing are not automated by this suite.

Run `node tests/seo-check.cjs` without extra dependencies to audit all 50 public
pages, canonical and language alternates, sitemap coverage, App/WebApplication
separation, localized tool capabilities and FAQ, internal links and the concise
`llms.txt` guide. This checks source consistency, not search-engine indexing or
guaranteed AI citations. The existing crawler access policy is unchanged.
