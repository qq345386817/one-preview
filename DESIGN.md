# OnePreview Website Design

The website uses a document-workspace visual language derived from the real App icon, existing native screenshots and the established website palette. Keep the light/dark themes system-driven. The production token source is `style/base.css`; the PDF workspace adds only tool-specific layout in `style/markdown-report.css`.

- Preserve the blue `--primary`, cyan `--cyan`, cool `--bg` and navy `--ink`. Use the small warm `--accent-orange` only as decoration, not text.
- Use `--text` and `--muted` on the matching theme's surfaces. Small links and labels use `--primary-dark`: the brighter brand blue is below 4.5:1 on the pale-blue surface. The filled primary action uses `--action-fill` with white text.
- Typography uses the original Avenir Next/Avenir stack and native fallbacks. Do not add external font/CDN requests. The headline weight is 650, body text 400, control text 600. Long translated words must wrap safely.
- Use the named spacing and radius variables. Actions and navigation have at least 44px targets, a visible keyboard focus state and a localized skip-to-content link. Keep the logo and language selector separate at 320px. Respect reduced motion.
- The App Store action is primary on landing pages. The independent web PDF converter is secondary there; saving/printing is primary inside the converter. Keep editor, preview, operation status and guidance visually distinct.
- Use the original, full-window, locale-matched App image. Its provenance is documented in `images/previews/README.md`. Never synthesize native chrome, crop the document or use a marketing illustration as an actual App screenshot.
- All 11 locales share the same structure. Preserve existing canonical routes, reciprocal hreflang, localized examples, supported-format coverage and the accurate iOS distinction: the App does not universally replace Files Quick Look.
- Do not change conversion behavior for a visual refresh. The PDF tool remains local to the browser, with explicit import limits, image selection, warnings and system print handoff.
- Keep the isolated report's CSP unchanged (`script-src 'self'`, `connect-src 'none'`). `_headers` applies `Cache-Control: public, max-age=0, must-revalidate, no-transform` only to the two report URL forms, preventing CDN auto-injected scripts from conflicting with that isolation. General website analytics settings are not changed. Validate the actual response headers and console after a Cloudflare deployment; a local static server cannot prove CDN behavior.

Before publishing, run the SEO and design source checks and the browser regressions in `tests/README.md`. Keep screenshots, logs, browser runtimes, exploratory design canvases and design-system draft artifacts outside this public repository. Update sitemap `lastmod` only for genuinely modified pages, and verify the public deployment rather than equating Git push with a completed release.
