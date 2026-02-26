import { db } from '@/server/db';

/**
 * Truncates all tables in the database (bypassing Prisma middleware).
 * Uses CASCADE to handle foreign key constraints automatically.
 *
 * Usage: pnpm db:reset
 */
async function main() {
  console.log('🗑️  Truncating all tables…');

  await db.$executeRaw`
    TRUNCATE TABLE
      "passengers_on_stops",
      "template_stop",
      "stop",
      "commute_template",
      "commute",
      "location",
      "notification_preference",
      "org_notification_channel",
      "invitation",
      "member",
      "organization",
      "account",
      "session",
      "verification",
      "user"
    CASCADE
  `;

  console.log('✅ All tables truncated');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
