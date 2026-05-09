import { envClient } from '@/env/client';

import { pushChannel } from './channels/push';
import { createSlackChannel } from './channels/slack';
import { terminalChannel } from './channels/terminal';
import { Notifier } from './notifier';

export type { NotificationEvent } from './types';

const notifier = new Notifier().register(terminalChannel);

// Slack and push channels kick off background HTTP calls that can reject
// after the response is already sent (FCM with the CI stub creds, Slack
// with no token). Node 24's default for unhandled rejections is to kill
// the process — that takes the dev server down mid-test-suite.
//
// Drop this guard once both channels guarantee no unhandled rejection
// (e.g. the FCM path wraps `getAccessToken` so the auth promise is
// settled-only, and the Slack channel no-ops cleanly when not
// configured). Same condition removes `--unhandled-rejections=warn`
// from playwright.config.ts.
if (envClient.VITE_ENV_NAME !== 'tests') {
  notifier.register(createSlackChannel()).register(pushChannel);
}

export { notifier };
// .register(emailChannel)    — future
