# Notification System

The app uses an **event-driven, multi-channel notification system**. When something happens (booking accepted, commute canceled, etc.), a typed event is dispatched through a central `Notifier` that fans out delivery to every registered channel.

## Architecture overview

```
Router / Cron job
  │
  │  context.notify(event, orgContext)
  │
  ▼
Notifier
  │  for each registered channel:
  │    1. filterEventForChannel()  — remove recipients who opted out of this channel
  │    2. channel.canSend()        — check prerequisites (config exists, tokens set up…)
  │    3. channel.send()           — deliver
  │
  ├──▶ PUSH   (FCM / Web Push)
  ├──▶ SLACK  (Bolt SDK — DMs + broadcast)
  └──▶ TERMINAL (dev-only console log)
```

All channels run concurrently via `Promise.allSettled` — a failure in one channel never blocks the others.

## Key files

| File | Role |
|---|---|
| `src/server/notifications/notifier.ts` | `Notifier` class — registers channels, dispatches events |
| `src/server/notifications/types.ts` | All event types, `Recipient`, `NotificationChannel` interface |
| `src/server/notifications/utils.ts` | `filterEventForChannel`, `toRecipient`, `getEventRecipients`, `isChannelEnabledForRecipient` |
| `src/server/notifications/index.ts` | Creates and exports the singleton `notifier` with all channels registered |
| `src/server/notifications/channels/push.ts` | Push channel — FCM token lookup, content rendering, delivery, stale token cleanup |
| `src/server/notifications/channels/slack.ts` | Slack channel — config decryption, user lookup, DM / broadcast posting |
| `src/server/notifications/channels/terminal.ts` | Terminal channel — logs events to console (dev only) |
| `src/features/push/templates.ts` | `getPushContent()` — returns `{ title, body, link }` per event type |
| `src/features/slack/templates/` | One JSX-Slack template file per event type |
| `src/server/cron/daily-reminder.ts` | Cron job: collects today's commutes, sends `commute.reminder` per org |

## Event types

### Shapes

Events come in three shapes depending on their audience:

| Shape | Field | Example events |
|---|---|---|
| **Single recipient** | `recipient: Recipient` | `booking.requested`, `booking.accepted`, `booking.refused`, `booking.canceled`, `commute.updated`, `commute.canceled` |
| **Multi recipient** | `recipients: Recipient[]` | `commute.reminder` |
| **Broadcast** (no recipient) | — | `commute.created`, `commute.requested` |

Broadcast events skip push notifications entirely (no individual recipient to target) and go to the Slack broadcast channel instead.

### Full list

| Event | Triggered when | Recipient(s) |
|---|---|---|
| `booking.requested` | Passenger requests a seat | Driver |
| `booking.accepted` | Driver accepts a booking | Passenger |
| `booking.refused` | Driver refuses a booking | Passenger |
| `booking.canceled` | Passenger cancels their booking | Driver |
| `commute.created` | Driver creates a new commute | Broadcast (Slack channel) |
| `commute.updated` | Driver modifies a commute (date, seats, type) | Each affected passenger |
| `commute.canceled` | Driver cancels a commute | Each affected passenger |
| `commute.requested` | Someone submits a commute request | Broadcast (Slack channel) |
| `commute.reminder` | Daily cron (7 AM UTC) | All participants of today's commutes |

### Type definitions

Each event is a discriminated union member of `NotificationEvent` (see `types.ts`). Every event carries a `payload` with context-specific data (driver name, date, org slug, etc.) and — for non-broadcast events — one or more `Recipient` objects.

A `Recipient` looks like:

```ts
type Recipient = {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  notificationPreferences?: ReadonlyArray<{ channel: NotificationChannelType }>;
};
```

The `notificationPreferences` array lists the channels the user has **enabled**. If empty or undefined, all channels are considered enabled by default.

## Channels

### Implementing a channel

A channel implements the `NotificationChannel` interface:

```ts
interface NotificationChannel {
  name: AllowedNotificationChannels;           // 'PUSH' | 'SLACK' | 'TERMINAL'
  canSend(event, orgContext?): boolean | Promise<boolean>;
  send(event, logger, orgContext?): Promise<void>;
}
```

- **`canSend`**: Return `false` to skip delivery entirely (e.g. Firebase not configured, Slack token missing).
- **`send`**: Perform the actual delivery. Errors are caught by the `Notifier` — throwing here won't crash the app.

Register a new channel in `src/server/notifications/index.ts`:

```ts
export const notifier = new Notifier()
  .register(terminalChannel)
  .register(createSlackChannel())
  .register(pushChannel);
  // .register(emailChannel)  — future
```

### Push (FCM / Web Push)

- Uses Firebase Cloud Messaging v1 API.
- Fetches FCM device tokens for each recipient from the `FcmToken` table.
- Renders personalized content per recipient via `getPushContent()`.
- Automatically cleans up stale tokens (FCM returns `NOT_FOUND` / `UNREGISTERED`).
- Skips broadcast events (`commute.created`, `commute.requested`).

Client-side setup:
- `src/features/push/firebase-client.ts` — lazy-loads Firebase SDK, registers service worker, retrieves FCM token.
- `src/features/push/use-push-notifications.ts` — hook that registers the device token on mount if permission is granted.
- `public/firebase-messaging-sw.js` — service worker that displays notifications and handles click-to-open.

### Slack

- Uses `@slack/bolt` to post messages.
- Config (encrypted token + broadcast channel + locale) is stored per-org in `OrgNotificationChannel`.
- Broadcast events → post to the org's configured default channel with @mention.
- Single-recipient events → DM the user (looked up by email via `users.lookupByEmail`).
- `commute.reminder` → DM each recipient individually with a personalized commute list.
- Templates are built with `jsx-slack` (Block Kit JSX) in `src/features/slack/templates/`.

### Terminal (dev only)

Logs the event type, recipient, and payload to the console via `logger.info`. Active only in dev mode.

## Recipient filtering

Before a channel's `send()` is called, the `Notifier` runs `filterEventForChannel()`:

1. **Single-recipient event**: If the recipient has opted out of that channel → event is skipped (`null`).
2. **Multi-recipient event**: Recipients who opted out are removed. If none remain → skipped.
3. **Broadcast event**: Passed through as-is (no recipients to filter).

Opt-out is determined by the `NotificationPreference` table: a member can disable specific channels. The `isChannelEnabledForRecipient()` util handles this check.

## How to fire a notification

In any ORPC procedure handler, call `context.notify()`:

```ts
// Single recipient
context.notify(
  {
    type: 'booking.accepted',
    recipient: toRecipient(passengerMember),
    payload: {
      commuteDate: commute.date,
      tripType: booking.tripType,
      driverName: driverMember.user.name,
      orgSlug: org.slug,
    },
  },
  { db: context.db, organizationId: org.id }
);
```

The `toRecipient()` helper (from `utils.ts`) maps a member (with included `user` and `notificationPreferences`) to a `Recipient`.

The second argument (`orgContext`) provides the database client and organization ID so channels can look up their own config (Slack token, push locale, etc.).

Notifications are **fire-and-forget** — the `notify()` call is awaited but does not block the HTTP response from being sent. Router handlers typically call `notify()` without `await` so the response returns immediately.

## Database models

### `FcmToken`

Stores FCM device tokens. A user can have multiple tokens (multiple devices). Max 10 per user — oldest are pruned on new registration.

### `NotificationPreference`

Per-member, per-channel opt-in record. Unique on `(memberId, channel)`. If no record exists for a channel, it's considered enabled.

### `OrgNotificationChannel`

Per-org channel configuration. Stores encrypted Slack bot token, broadcast channel, locale, and enabled flag. Unique on `(orgId, type)`.

## Adding a new event type

1. **Define the event type** in `types.ts` — add it to the `NotificationEvent` union.
2. **Fire it** from the relevant router handler using `context.notify()`.
3. **Add templates**:
   - Push: add a `.with()` case in `getPushContent()` (`src/features/push/templates.ts`).
   - Slack: create a template in `src/features/slack/templates/`, wire it in the `getPrivateBlocks` / `getBroadcastBlocks` router.
4. **Add i18n keys** for push notification title/body in the `notifications` namespace.

The `NotificationEvent` union is exhaustive — TypeScript will flag any unhandled event in template switches.

## Adding a new channel

1. Implement `NotificationChannel` (see existing channels for reference).
2. Register it in `src/server/notifications/index.ts`.
3. Add the channel type to the `NotificationChannelType` Prisma enum if it needs per-user preferences.
4. Update the notification preferences UI in `src/features/account/notification-preferences.tsx`.
