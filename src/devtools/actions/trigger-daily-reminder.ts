import { createServerFn } from '@tanstack/react-start';
import { Effect } from 'effect';

import { sendDailyReminders } from '@/server/cron/daily-reminder';
import { db } from '@/server/db';
import { logger } from '@/server/logger';
import { notifier } from '@/server/notifications';

export const triggerDailyReminder = createServerFn({ method: 'POST' }).handler(
  async () => {
    await Effect.runPromise(
      Effect.tryPromise(() => sendDailyReminders(db, notifier, logger)).pipe(
        Effect.tapError((err) =>
          Effect.sync(() =>
            logger.error({ err }, '[DEV] Daily reminder trigger failed')
          )
        )
      )
    );
  }
);
