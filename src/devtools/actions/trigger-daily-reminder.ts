import { createServerFn } from '@tanstack/react-start';
import { Result } from 'better-result';

import { sendDailyReminders } from '@/server/cron/daily-reminder';
import { db } from '@/server/db';
import { logger } from '@/server/logger';
import { notifier } from '@/server/notifications';

export const triggerDailyReminder = createServerFn({ method: 'POST' }).handler(
  async () => {
    const result = await Result.tryPromise(() =>
      sendDailyReminders(db, notifier, logger)
    );

    if (result.isErr()) {
      logger.error(
        { err: result.error },
        '[DEV] Daily reminder trigger failed'
      );
      throw result.error;
    }
  }
);
