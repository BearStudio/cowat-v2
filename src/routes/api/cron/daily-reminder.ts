import { createFileRoute } from '@tanstack/react-router';
import { Result } from 'better-result';

import { envServer } from '@/env/server';
import { sendDailyReminders } from '@/server/cron/daily-reminder';
import { db } from '@/server/db';
import { logger } from '@/server/logger';
import { notifier } from '@/server/notifications';

async function handle({ request }: { request: Request }) {
  // Verify the request comes from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${envServer.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await Result.tryPromise(() =>
    sendDailyReminders(db, notifier, logger)
  );

  if (result.isErr()) {
    logger.error({ err: result.error }, '[CRON] Daily reminder failed');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export const Route = createFileRoute('/api/cron/daily-reminder')({
  server: {
    handlers: {
      GET: handle,
    },
  },
});
