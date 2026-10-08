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
