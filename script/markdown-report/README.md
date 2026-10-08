# Standalone Markdown to PDF

Public tools: `/tools/markdown-to-pdf/` and `/zh-Hans/tools/markdown-to-pdf/`.
The HTML pages and this directory are sufficient to run the tool on a static host.
No App, account, backend, document upload, or build step is required.

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
