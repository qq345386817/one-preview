# Authentic App Previews

These are full-window captures of OnePreview 1.4.8 (build 154), not App Store release evidence. The original eleven locale images were captured on 2026-11-14 from a local development-signed Release verification build. Arabic was added on 2026-11-15 from a local Debug verification build. `manifest.json` records dimensions, exact final-file hashes and the differing Arabic capture date/configuration/executable hash; the top-level executable hash describes only the original eleven images.

The native capture sources are retained in the parent repository under `artifacts/` (ignored). Arabic comes from `artifacts/localization-ar-2026-11-15/native/mac/ar-SA/01-markdown.png`. The command is `scripts/capture_native_store_mac.py --captures 01-markdown`; no Finder restart, system appearance change or installed-app replacement is required. Website `en` maps to capture `en-US`, `de` to `de-DE`, `fr` to `fr-FR` and `ar` to `ar-SA`.

All images are 1180 x 820 and retain the actual dark appearance, native toolbar and full document area. Arabic shows real Arabic UI and sample content, not relabeled English. PNG compression is lossless; decoded RGBA fingerprints before/after the Arabic optimization match. The website image may keep transparency around the native window; App Store marketing images are composed separately as opaque RGB PNGs.

Do not crop, paint over, stretch or synthesize native chrome or documents. Each homepage identifies the local verification version and explains that the available App Store version may differ. Captures demonstrate UI only; they do not establish Finder provider selection, physical-device behavior, review approval or public availability.
