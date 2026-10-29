# Streaming Ad Skipper

Streaming Ad Skipper is a Manifest V3 Chrome extension that observes supported
player interfaces locally and only automates controls that can be verified as
safe. It does not promise universal ad removal: server-side or same-stream
advertising may not be removable from a browser extension.

## Current status

The initial adapter targets `primevideo.com` and is **experimental and
diagnostic-only**. The project deliberately contains no fabricated Prime Video
selectors or network endpoints. No automatic skipping or muting is enabled by
the current adapter until a real playback session establishes reliable,
observable signals.

Netflix is listed as a future adapter but is not enabled or supported.

## Development

Prerequisite: Node.js 20.19+ LTS, 22.13+ LTS, or 24+ and Chrome. Node 23 is
not in the supported range of the current ESLint dependency tree.

```sh
npm install
npm run typecheck
npm test
npm run lint
npm run build
```

Load `dist/` at `chrome://extensions` with **Developer mode** and **Load
unpacked**. `npm run dev` rebuilds on changes.

## Privacy and permissions

The extension requests `storage` plus host access only for the two Prime Video
URL patterns in the manifest. Settings and bounded diagnostic entries stay in
`chrome.storage.local` or the content-script process; no titles, watch history,
credentials, cookies, sensitive query parameters, analytics, or remote
telemetry are collected.

## Adding an adapter

Implement `StreamingAdapter` in `src/adapters`, register it only after URL
matching and player behavior are verified in a real session, and add tests for
matching, evidence expiry, safe controls, replacement cleanup, and no-action
cases. Do not use network interception, DRM circumvention, decryption, or
automatic seeking across protected intervals.

## Manual verification plan

Use a test account and a real playback session to inspect ordinary content,
advertising, unavailable controls, buffering, player replacement, SPA route
changes, unsupported services, disabled diagnostics, invalid settings, and
advertisement-like UI during content. DevTools inspection must not reveal or
store account data. Automated tests cover settings validation and safe control
validation; real ad behavior remains unverified until documented with evidence.

## Publication checklist

- Verify each supported URL and selector against current production playback.
- Confirm Chrome manifest and permission review with a clean production build.
- Run typecheck, lint, tests, and build.
- Review privacy text and remove diagnostic data before release if not needed.
- Update release notes and disclose limitations; never claim universal blocking.

## License

This project is proprietary to **KalebeRS** under the
[KalebeRS Private Source and Contribution License](./LICENSE). The source may
be inspected and contributions may be submitted through pull requests, but
reproduction, redistribution, publication, sublicensing, sale, and commercial
use require prior written permission from KalebeRS.
