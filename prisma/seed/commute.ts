import { faker } from '@faker-js/faker';

import { db } from '@/server/db';

import { SEED_EMAILS } from './user';

/**
 * Returns Monday 00:00 of the current ISO week.
 */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function createCommutes() {
  console.log(`⏳ Seeding commutes, stops, and passenger bookings`);

  let commutesCreated = 0;
  let stopsCreated = 0;
  let bookingsCreated = 0;

  const seedUsers = (
    await Promise.all(
      SEED_EMAILS.map((email) =>
        db.user.findUnique({ where: { email }, select: { id: true } })
      )
    )
  ).filter((u): u is { id: string } => u !== null);

  const weekStart = getWeekStart();

  for (const driver of seedUsers) {
    const locations = await db.location.findMany({
      where: { userId: driver.id },
      select: { id: true },
    });
    if (locations.length === 0) continue;

    const existingCount = await db.commute.count({
      where: { driverId: driver.id },
    });
    if (existingCount > 0) continue;

    // Create one commute per weekday (Mon-Fri) for each seed user
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const type = faker.helpers.arrayElement(['ROUND', 'ONEWAY'] as const);

      const commute = await db.commute.create({
        data: {
          date: addDays(weekStart, dayOffset),
          seats: faker.number.int({ min: 1, max: 4 }),
          type,
          status: 'UNKNOWN',
          driverId: driver.id,
        },
      });
      commutesCreated += 1;

      // Create a stop at each of the user's locations
      for (let order = 0; order < locations.length; order++) {
        const stop = await db.stop.create({
          data: {
            order,
            outwardTime: `${faker.number.int({ min: 6, max: 10 }).toString().padStart(2, '0')}:${faker.helpers.arrayElement(['00', '15', '30', '45'])}`,
            inwardTime:
              type === 'ROUND'
                ? `${faker.number.int({ min: 16, max: 19 }).toString().padStart(2, '0')}:${faker.helpers.arrayElement(['00', '15', '30', '45'])}`
                : null,
            commuteId: commute.id,
            locationId: locations[order]!.id,
          },
        });
        stopsCreated += 1;

        // Add the other seed user as a passenger on the first stop
        if (order === 0) {
          const otherUser = seedUsers.find((u) => u.id !== driver.id);
          if (otherUser) {
            await db.passengersOnStops.create({
              data: {
                tripType: type === 'ROUND' ? 'ROUND' : 'ONEWAY',
                status: 'ACCEPTED',
                passengerId: otherUser.id,
                stopId: stop.id,
              },
            });
            bookingsCreated += 1;
          }
        }
      }
    }
  }

  console.log(
    `✅ ${commutesCreated} commutes, ${stopsCreated} stops, ${bookingsCreated} bookings created`
  );
}
