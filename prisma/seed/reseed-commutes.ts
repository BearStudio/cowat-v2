import { db } from '@/server/db';

import { createCommutes } from './commute';
import { getDefaultOrgId } from './organization';

/**
 * Deletes all existing commutes (cascading stops + bookings) and re-seeds
 * commutes for the current week. Useful to quickly populate the dashboard.
 *
 * Usage: pnpm db:seed:week
 */
async function main() {
  console.log('🗑️  Deleting existing commutes, stops, and bookings…');

  await db.passengersOnStops.deleteMany();
  await db.stop.deleteMany();
  await db.commute.deleteMany();

  console.log('✅ Cleared');

  const orgId = await getDefaultOrgId();
  await createCommutes(orgId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
