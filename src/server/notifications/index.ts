import { createSlackChannel } from './channels/slack';
import { terminalChannel } from './channels/terminal';
import { Notifier } from './notifier';

export type { NotificationEvent, Recipient } from './types';

export const notifier = new Notifier()
  .register(terminalChannel)
  .register(createSlackChannel());
// .register(emailChannel)    — future
// .register(pushChannel)     — future
