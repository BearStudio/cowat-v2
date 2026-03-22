# Push Notifications — Architecture & Troubleshooting

## Architecture Overview

Push notifications use **Firebase Cloud Messaging (FCM)** with two distinct parts:

### Client Side (browser)

- **Firebase JS SDK** (`firebase/messaging`) handles push subscription via the standard Web Push API
- `getFcmToken()` in `firebase-client.ts` initializes Firebase, registers the service worker, and calls `getToken()` to get an FCM token
- The FCM token is sent to the server via `registerFcmToken` and stored in the `FcmToken` table
- The **service worker** (`public/firebase-messaging-sw.js`) handles displaying notifications when received — it does NOT use the Firebase SDK, just raw `push` and `notificationclick` event listeners
- The `usePushNotifications` hook in the app layout runs on mount: requests permission, gets a token, registers it

### Server Side (Vercel serverless)

- **No Firebase Admin SDK** — we use the FCM HTTP v1 REST API directly
- `firebase.ts` handles OAuth2 authentication: signs a JWT with the service account's private key (Node.js `crypto`), exchanges it for an access token, and caches it for ~55 minutes
- `push.ts` sends one HTTP request per device token via `sendFcmMessage()`, using `Promise.allSettled` for parallel delivery
- Invalid tokens (NOT_FOUND / UNREGISTERED) are automatically cleaned up from the database

### Config / Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_FIREBASE_*` | Client | Firebase client config (apiKey, projectId, etc.) |
| `FIREBASE_VAPID_PUBLIC_KEY` | Client (via API) | VAPID key for Web Push subscription |
| `FIREBASE_SERVICE_ACCOUNT` | Server only | Base64-encoded service account JSON |
| `FIREBASE_PROJECT_ID` | Server only | GCP project ID for FCM API calls |

The client fetches its config from `/api/firebase-config` (server route that exposes only VITE-prefixed vars + VAPID key).

---

## What Went Wrong & Why

### 1. `firebase-admin` SDK bundled as ESM → `SDK_VERSION` error

**Symptom:**
```
TypeError: Cannot read properties of undefined (reading 'SDK_VERSION')
    at file:///var/task/_libs/firebase-admin+[...].mjs:32374:20
```

**Root cause:** Nitro (the server framework used by TanStack Start) bundles all server dependencies into ESM `.mjs` files in `_libs/`. The `firebase-admin` SDK has internal CJS-to-ESM interop issues — when re-bundled as ESM by Rollup, the `@firebase/app` internal module doesn't export `SDK_VERSION` correctly.

**What we tried (and why it failed):**

| Attempt | Why it failed |
|---|---|
| `externals.external: ['firebase-admin']` in Nitro config | Wrong config key — Nitro v3 doesn't have `externals.external` |
| `traceDeps: ['firebase-admin']` | Tells Nitro to trace the package, but doesn't prevent Rollup from bundling it. The package ends up in BOTH `_libs/` (broken ESM bundle) and theoretically `node_modules/` |
| `await import('firebase-admin/app')` (dynamic imports) | Rollup still detects and bundles dynamic imports into `_libs/` as ESM chunks — same SDK_VERSION error |
| `createRequire(import.meta.url)` to load as CJS | Bypasses Rollup completely, but the package isn't traced/copied to the deployment. `Cannot find module 'firebase-admin'` at runtime |
| `rollupConfig.external: [/^firebase-admin/]` + `traceDeps` | `rollupConfig.external` successfully prevents bundling, but `traceDeps` doesn't copy the package to `node_modules/` in the Vercel function output |

**The fundamental problem:** On Vercel, Nitro's dependency management has a gap — you can either bundle a package (breaking ESM-incompatible packages) or externalize it (but it may not be traced into the deployment). There's no reliable way to say "don't bundle this, but include it as-is."

**Final fix:** Remove `firebase-admin` entirely. Use the **FCM HTTP v1 REST API** directly with Node.js built-in `crypto` for JWT signing and `fetch` for HTTP requests. Zero external server dependencies = zero bundler issues.

### 2. Service worker event handlers not registered synchronously

**Symptom (browser console):**
```
Event handler of 'push' event must be added on the initial evaluation of worker script.
Event handler of 'pushsubscriptionchange' event must be added on the initial evaluation of worker script.
```

**Root cause:** The browser requires service worker event handlers (`push`, `notificationclick`) to be registered synchronously during the script's initial evaluation. If they're registered inside an async callback (e.g., a `.then()` after fetching Firebase config), the browser rejects them.

**Fix:** The service worker (`firebase-messaging-sw.js`) was rewritten to NOT use the Firebase SDK at all. It registers `push` and `notificationclick` handlers synchronously at the top level:

```js
self.addEventListener('push', function (event) { /* ... */ });
self.addEventListener('notificationclick', function (event) { /* ... */ });
```

The Firebase client SDK on the page handles the push subscription — the SW only needs to display incoming notifications and handle clicks.

### 3. Service worker "shutting down" on Firefox

**Symptom:** The SW appears in `about:debugging` but shows as stopped. Starting it manually causes it to stop again after a few seconds.

**Not a bug.** Service workers are event-driven. The browser starts them when an event arrives (`push`, `notificationclick`) and kills them after a few seconds of inactivity. This is the expected lifecycle on all browsers, but Firefox is more visibly aggressive about it.

### 4. Notifications not received despite "successful" sends

**Symptom:** Server logs show `successCount: 2`, but the user doesn't see notifications.

**Possible causes:**
- **OS/browser notifications disabled:** Firefox and macOS both have notification settings that override web app permissions. Check: Firefox Settings → Privacy → Notifications AND macOS System Settings → Notifications → Firefox
- **Stale tokens:** The "successful" sends may target tokens from old browser sessions. FCM reports success if the token was once valid, even if the device is offline. Tokens are cleaned up on `NOT_FOUND`/`UNREGISTERED` errors
- **Foreground vs background:** When the page is in the foreground, the SW still handles notifications via `showNotification`. If notifications appear but aren't visible, check OS "Do Not Disturb" mode
- **Wrong user:** Tokens are stored per `userId`. Verify the token in the DB matches `window.fcmToken` (dev mode only)

---

## Debugging Checklist

### Client side

1. **Permission granted?**
   ```js
   Notification.permission // should be "granted"
   ```

2. **Service worker registered?**
   ```js
   navigator.serviceWorker.getRegistrations().then(r => console.log(r))
   // Should show a registration with scope "https://your-domain/"
   ```

3. **FCM token obtained?**
   ```js
   window.fcmToken // dev mode only — should be a string, not undefined
   ```

4. **Firebase config accessible?**
   ```js
   fetch('/api/firebase-config').then(r => r.json()).then(console.log)
   // Check that vapidPublicKey is present
   ```

5. **SW file loads?**
   Navigate to `/firebase-messaging-sw.js` directly — should show the JS file, not HTML

6. **Manual notification test:**
   ```js
   navigator.serviceWorker.ready.then(r =>
     r.showNotification('Test', { body: 'Hello' })
   )
   // If this works → SW is fine, problem is upstream (FCM delivery or server)
   // If nothing appears → check OS notification settings
   ```

### Server side (Vercel logs)

1. **`Firebase: access token obtained`** — OAuth2 token successfully fetched from Google
2. **`[NOTIFY] canSend result` with `canSend: true` for push** — push channel is active
3. **`[NOTIFY] channel disabled for recipient, skipping`** — user disabled push in account preferences
4. **`Push: some notifications failed to send`** — check `errors` array for details
5. **`Push: removed invalid FCM tokens`** — stale tokens cleaned up (normal)

### Common env var issues

- `FIREBASE_SERVICE_ACCOUNT` must be the **base64-encoded** full service account JSON (not the raw JSON, not a file path)
- `FIREBASE_PROJECT_ID` must match the GCP project in the service account
- `FIREBASE_VAPID_PUBLIC_KEY` must be set for the client to get an FCM token — without it, `getFcmToken()` returns `null` silently

---

## Key Principles

1. **No `firebase-admin` on the server.** The SDK is incompatible with Nitro/Vercel's ESM bundling. Use the FCM REST API directly.

2. **The service worker is minimal and stateless.** It doesn't import Firebase SDK, doesn't need config, and only handles `push` + `notificationclick` events. All push subscription management is done by the Firebase client SDK on the page.

3. **Event handlers in service workers MUST be synchronous.** Never register `push`/`notificationclick` handlers inside async callbacks, `.then()`, or dynamic imports. They must be at the top level of the SW script.

4. **FCM tokens are ephemeral.** They can become invalid at any time (browser update, SW re-registration, user clearing data). The server cleans up invalid tokens automatically on send failures. The client re-registers on every app load.

5. **The notification preference (PUSH channel) is server-side only.** When disabled, the server skips push delivery. The token stays registered (it's re-created on every page load anyway). When re-enabled, notifications resume immediately.
