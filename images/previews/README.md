# Authentic App Previews

These are unchanged, full-window captures of OnePreview 1.4.7 (build 153) displaying the project's localized Markdown sample. They were captured on 2026-10-27 from the development-signed universal Release archive used to export the App Store package. The captures use `scripts/capture_native_store_mac.py --captures 01-markdown` in the parent app repository, with no Finder restart, system appearance change or replacement of the installed app.

The native source files are retained locally at `artifacts/website-captures-1.4.7-153-2026-10-27/mac/<locale>/01-markdown.png`. Website locale `en` maps to capture `en-US`, `de` to `de-DE`, and `fr` to `fr-FR`; the other locale names match directly. Each landing page uses its matching document and UI language. `manifest.json` records the exact image hashes and dimensions, checked by `tests/design-check.cjs`.

Each original PNG is 1180 x 820. Images retain their actual dark appearance, native window chrome and complete document area, including the native compact toolbar in languages with longer labels. Do not stretch, crop, paint over, recreate the window or replace it with an invented mockup. Only intentionally public sample content is captured.

These are native-app UI previews, not screenshots of the independent web PDF converter or proof of App Store release status. Each homepage identifies version 1.4.7 and states in its own language that the available App Store version may differ. The app's review status is deliberately not hard-coded into site copy.
