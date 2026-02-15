import { terminalChannel } from './channels/terminal';
import { Notifier } from './notifier';

export type { NotificationEvent, Recipient } from './types';

export const notifier = new Notifier().register(terminalChannel);
// .register(emailChannel)    — future
// .register(slackChannel)    — future
// .register(pushChannel)     — future
