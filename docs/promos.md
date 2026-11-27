# Customer promo popup

The customer dashboard checks for a promotion after the splash screen finishes. Only verified customer sessions can access the promo APIs. Admin and cashier sessions are excluded.

## Database connection

`PROMOS_MONGODB_URI` must point to the same MongoDB database used by **powerup-dashboard**. The app's existing `MONGODB_URI` remains the customer-data connection. If `PROMOS_MONGODB_URI` is omitted, promos use `MONGODB_URI`; this only works when both projects use the same database. The local configuration copies the dashboard connection into the PWA's ignored `.env.local` without printing credentials. Set the same variable in the PWA hosting environment when deploying.

The PWA uses a separate, cached connection and performs only reads against `promos`. It does not create collections or indexes. Promo fields and ordering match the dashboard.

## Selection and display

- Enabled promos qualify at their start time and stop qualifying at their end time. Missing boundaries are unrestricted.
- Highest numeric priority wins. Ties use oldest creation time, then ascending ID.
- `GET /api/promos/active` exposes only the selected promo's title, safe HTTP(S) link and authenticated image URL, plus server-derived display timing.
- `GET /api/promos/:id/image?v=...` rechecks authentication, eligibility and image version before serving bytes.
- The popup loads and decodes the image before claiming the daily display. Failed images, API errors and offline use do not block the dashboard or consume the daily display.
- Close button, Escape, outside click, and Continue dismiss the dialog. Optional Learn more opens the promo link in a new tab and dismisses the popup.
- The popup closes at expiry, Philippine midnight, or when the app goes offline. It does not interrupt another open dialog.

## Once per day/device

The daily reset is midnight **Asia/Manila** using the server's date, across all promos and accounts. IndexedDB stores the last displayed day for this app origin and browser profile; logging out, switching accounts, refreshing, or visiting another route does not clear it. An atomic transaction prevents two tabs claiming the same day. The next eligible check occurs when the dashboard mounts, regains focus, becomes visible, or reconnects.

If browser storage is unavailable, skip the popup. Clearing website data, private browsing, a different browser, or a separately isolated installed-app storage container can reset the device history. No hardware fingerprint is collected.

Promo APIs and artwork are network-only in the service worker, with no cached/offline fallback. Existing unrelated service-worker edits are preserved.

## Verification

Run `node --test tests/promos.test.cjs` for selection, schedule boundaries, safe links, authorization, response shape, image eligibility and service-worker behavior. Database calls are mocked. Browser checks should cover popup dismissal, refresh and login repetition, concurrent daily claims, mobile layout, broken artwork, and API errors.

Popup frequency is once per promo per Philippine calendar day per browser/device. A different promo has its own daily record. Legacy global records are ignored. The visible dashboard rechecks eligibility every 30 seconds, including after another dialog temporarily blocks the popup.
