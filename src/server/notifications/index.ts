import { pushChannel } from './channels/push';
import { createSlackChannel } from './channels/slack';
import { terminalChannel } from './channels/terminal';
import { Notifier } from './notifier';

export type { NotificationEvent } from './types';

export const notifier = new Notifier()
  .register(terminalChannel)
  .register(createSlackChannel())
  .register(pushChannel);
// .register(emailChannel)    — future
