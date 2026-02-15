import { App } from '@slack/bolt';

import { envServer } from '@/env/server';

let app: App | null = null;

export function getSlackApp(): App | null {
  if (!envServer.SLACK_BOT_TOKEN) return null;

  if (!app) {
    app = new App({
      token: envServer.SLACK_BOT_TOKEN,
      // No socket/http listener needed — we only use the Web API client
      signingSecret: '',
    });
  }

  return app;
}
