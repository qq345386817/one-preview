# Standalone Markdown to PDF

Public tool: `/tools/markdown-to-pdf/` (English), plus the same path under
`/zh-Hans/`, `/zh-Hant/`, `/ja/`, `/ko/`, `/de/`, `/fr/`, `/hi/`, `/id/` and `/ru/`.
The HTML pages and this directory are sufficient to run the tool on a static host.
No App, account, backend, document upload, or build step is required.

Each language has its own indexable HTML page, metadata, language selector and
Markdown example. Runtime messages are embedded in that page as `tool-messages`
JSON, including validation errors and printed page labels. This is tool-specific
configuration, not a client-side replacement for the site's static translations.
Shared report error/label translations match the native app's string catalog;
web-only messages explain browser actions rather than native panels. Keep every
locale's message keys and `{count}` / `%d` placeholders in sync when editing.

The document is rendered in a report iframe, sanitized with DOMPurify, and arranged
into explicit A4 pages before browser printing. The print action opens the browser
or system print dialog; it does not claim to directly download a generated PDF.
Users can select local raster images for relative references. Missing resources
produce visible notices. Text is preserved rather than rasterized into screenshots.

Limits: 500 KB Markdown, 100 pages, up to 16 images (5 MB per image, 20 MB total).
One layout; MDX components, scripts, TextBundle/TextPack and arbitrary HTML are
outside the first release. Over-height rows and over-width content fail explicitly.

Vendor versions and notices: Marked 12.0.1 (MIT), Highlight.js 11.9.0 (BSD-3-Clause),
Mermaid 10.9.1 (MIT), KaTeX 0.16.8 (MIT), DOMPurify 3.4.16 (Apache-2.0 or MPL-2.0).
License files are in `licenses/`. The native OnePreview exporter shares the layout
code and acceptance fixtures; this website remains independently deployable.

Local validation: serve this repository with a static server and exercise text
input, Markdown selection, image selection, stale-preview detection, print action,
long tables, long code, formulas and diagrams. Check actual PDF text and A4 page
dimensions as well as screenshots. Chromium and WebKit have been exercised;
system print-dialog choices still require device-level checks.

Known print compatibility limit: in the macOS Chromium headless PDF smoke check,
Hindi/Devanagari appears correctly but some extracted characters become nulls in
both PDFKit and pypdf. Trials with Noto Sans Devanagari and tagged PDF output did
not fix the extraction.
The Hindi print instructions warn users to verify copied text before sharing.
Do not treat visual preview or selectable text alone as proof of accurate Unicode
copying. Other browsers and system print destinations need separate verification.
