import type { LanguageKey } from '@/lib/i18n/constants';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/lib/i18n/constants';

const LANGUAGE_KEYS = AVAILABLE_LANGUAGES.map((l) => l.key);

import JSXSlack from 'jsx-slack';

import type { BroadcastEvent, BroadcastOpts, PrivateEvent } from './templates';
import {
  getBroadcastBlocks,
  getFallbackText,
  getPrivateBlocks,
  type SlackBlock,
} from './templates';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

type TemplateFixture =
  | { event: BroadcastEvent; opts?: BroadcastOpts }
  | { event: PrivateEvent; opts?: { locale?: LanguageKey } };

const FIXTURES: Record<string, TemplateFixture> = {
  'booking-requested': {
    event: {
      type: 'booking.requested',
      recipient: {
        userId: 'user-1',
        name: 'John Driver',
        email: 'john.driver@example.com',
      },
      payload: {
        commuteDate: new Date('2026-03-15'),
        tripType: 'ROUND',
        passengerName: 'Alice Passenger',
        status: 'REQUESTED',
        orgSlug: 'acme-corp',
      },
    },
  },
  'booking-accepted': {
    event: {
      type: 'booking.accepted',
      recipient: {
        userId: 'user-2',
        name: 'Alice Passenger',
        email: 'alice@example.com',
      },
      payload: {
        commuteDate: new Date('2026-03-15'),
        tripType: 'ROUND',
        driverName: 'John Driver',
        orgSlug: 'acme-corp',
      },
    },
  },
  'booking-refused': {
    event: {
      type: 'booking.refused',
      recipient: {
        userId: 'user-2',
        name: 'Alice Passenger',
        email: 'alice@example.com',
      },
      payload: {
        commuteDate: new Date('2026-03-15'),
        tripType: 'ONEWAY',
        driverName: 'John Driver',
        orgSlug: 'acme-corp',
      },
    },
  },
  'booking-canceled': {
    event: {
      type: 'booking.canceled',
      recipient: {
        userId: 'user-1',
        name: 'John Driver',
        email: 'john.driver@example.com',
      },
      payload: {
        commuteDate: new Date('2026-03-15'),
        tripType: 'RETURN',
        passengerName: 'Alice Passenger',
        orgSlug: 'acme-corp',
      },
    },
  },
  'commute-created': {
    event: {
      type: 'commute.created',
      payload: {
        commuteId: 'commute-abc123',
        commuteDate: new Date('2026-03-15'),
        commuteType: 'ROUND',
        driverName: 'John Driver',
        driverEmail: 'john.driver@example.com',
        seats: 3,
        stops: [
          {
            stopId: 'stop-001',
            locationName: 'Home',
            locationAddress: '12 Rue de la Paix, 75002 Paris',
            outwardTime: '08:30',
            inwardTime: '18:00',
          },
          {
            stopId: 'stop-002',
            locationName: 'Office',
            locationAddress: '25 Avenue des Champs-Élysées, 75008 Paris',
            outwardTime: '09:00',
            inwardTime: '17:30',
          },
        ],
        orgSlug: 'acme-corp',
      },
    },
    opts: {
      baseUrl: 'http://localhost:3000',
      driverAvatarUrl:
        'https://api.dicebear.com/9.x/avataaars/svg?seed=John&backgroundColor=b6e3f4',
    },
  },
  'commute-updated': {
    event: {
      type: 'commute.updated',
      recipient: {
        userId: 'user-2',
        name: 'Alice Passenger',
        email: 'alice@example.com',
      },
      payload: {
        commuteDate: new Date('2026-03-15'),
        commuteType: 'ROUND',
        driverName: 'John Driver',
        orgSlug: 'acme-corp',
        newCommuteDate: new Date('2026-03-22'),
        newCommuteType: 'ONEWAY',
        previousSeats: 2,
        newSeats: 4,
      },
    },
  },
  'commute-canceled': {
    event: {
      type: 'commute.canceled',
      recipient: {
        userId: 'user-2',
        name: 'Alice Passenger',
        email: 'alice@example.com',
      },
      payload: {
        commuteDate: new Date('2026-03-15'),
        commuteType: 'ONEWAY',
        driverName: 'John Driver',
        orgSlug: 'acme-corp',
      },
    },
  },
  'commute-requested': {
    event: {
      type: 'commute.requested',
      payload: {
        commuteDate: new Date('2026-03-15'),
        requesterName: 'Alice Passenger',
        requesterEmail: 'alice@example.com',
        orgSlug: 'acme',
        locationName: 'Paris Office',
      },
    },
    opts: {
      baseUrl: 'https://app.example.com',
    },
  },
};

// ---------------------------------------------------------------------------
// HTML page renderer
// ---------------------------------------------------------------------------

function renderPreviewPage(
  template: string,
  locale: LanguageKey,
  blocks: SlackBlock[]
): string {
  const blocksJson = JSON.stringify({ blocks });
  const allTemplates = Object.keys(FIXTURES);

  const navLinks = allTemplates
    .map(
      (name) =>
        `<a class="nav-link${name === template ? ' active' : ''}" href="/api/dev/slack/${name}?locale=${locale}">${name}</a>`
    )
    .join('');

  const localeLinks = LANGUAGE_KEYS.map(
    (lang) =>
      `<a class="locale-link${lang === locale ? ' active' : ''}" href="/api/dev/slack/${template}?locale=${lang}">${lang.toUpperCase()}</a>`
  ).join('');

  const prettyJson = JSON.stringify(JSON.parse(blocksJson), null, 2)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slack Preview — ${template}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1d1c1d; background: #f8f8f8; }
    .layout { display: grid; grid-template-columns: 220px 1fr; min-height: 100%; }
    .sidebar { background: #3f0e40; padding: 16px 0; }
    .sidebar-title { color: #ffffff80; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 8px 16px 12px; }
    .nav-link { display: block; padding: 6px 16px; color: #ffffffb3; text-decoration: none; font-size: 13px; border-radius: 4px; margin: 1px 8px; }
    .nav-link:hover, .nav-link.active { background: #ffffff1a; color: #fff; }
    .main { padding: 28px 32px; }
    .toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .toolbar h1 { font-size: 16px; font-weight: 700; }
    .right { display: flex; align-items: center; gap: 12px; }
    .locale-links { display: flex; gap: 6px; }
    .locale-link { padding: 3px 8px; border-radius: 4px; border: 1px solid #ddd; background: #fff; color: #555; text-decoration: none; font-size: 12px; font-weight: 600; }
    .locale-link.active { background: #4a154b; border-color: #4a154b; color: #fff; }
    .bkb-btn { padding: 5px 12px; border-radius: 4px; background: #4a154b; color: #fff; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; }
    .bkb-btn:hover { background: #3f0e40; }
    .card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; }
    pre { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 12px; line-height: 1.6; overflow-x: auto; color: #1d1c1d; }
  </style>
</head>
<body>
  <div class="layout">
    <nav class="sidebar">
      <div class="sidebar-title">Templates</div>
      ${navLinks}
    </nav>
    <div class="main">
      <div class="toolbar">
        <h1>${template}</h1>
        <div class="right">
          <div class="locale-links">${localeLinks}</div>
          <a class="bkb-btn" id="bkb-link" href="#" target="_blank">Open in Block Kit Builder ↗</a>
        </div>
      </div>
      <div class="card">
        <pre>${prettyJson}</pre>
      </div>
    </div>
  </div>
  <script>
    const blocks = ${blocksJson};
    document.getElementById('bkb-link').href =
      'https://app.slack.com/block-kit-builder#' + encodeURIComponent(JSON.stringify(blocks));
  </script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function previewSlackRoute(
  template: string,
  query: Record<string, string>
): Response {
  const fixture = FIXTURES[template];
  if (!fixture) {
    return new Response('Template not found', { status: 404 });
  }

  const locale: LanguageKey =
    query['locale'] && LANGUAGE_KEYS.includes(query['locale'] as LanguageKey)
      ? (query['locale'] as LanguageKey)
      : DEFAULT_LANGUAGE_KEY;

  const isBroadcast =
    fixture.event.type === 'commute.created' ||
    fixture.event.type === 'commute.requested';

  const element = isBroadcast
    ? getBroadcastBlocks(fixture.event as BroadcastEvent, {
        ...fixture.opts,
        locale,
      })
    : getPrivateBlocks(fixture.event as PrivateEvent, {
        locale,
        baseUrl: 'http://localhost:3000',
      });

  const blocks = JSXSlack(element) as SlackBlock[];

  const html = renderPreviewPage(template, locale, blocks);
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

export { getFallbackText };
