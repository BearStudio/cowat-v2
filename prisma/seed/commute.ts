import { faker } from '@faker-js/faker';

import { db } from '@/server/db';

import { SEED_EMAILS } from './user';

function getToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function createCommutes(organizationId: string) {
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

  const seedMembers = (
    await Promise.all(
      seedUsers.map((u) =>
        db.member.findFirst({
          where: { userId: u.id, organizationId },
          select: { id: true, userId: true },
        })
      )
    )
  ).filter((m): m is { id: string; userId: string } => m !== null);

  const today = getToday();

  for (const driverMember of seedMembers) {
    const locations = await db.location.findMany({
      where: { memberId: driverMember.id },
      select: { id: true },
    });
    if (locations.length === 0) continue;

    const existingCount = await db.commute.count({
      where: { driverMemberId: driverMember.id },
    });
    if (existingCount > 0) continue;

    // Create one commute per day for the next 7 days (today + 6)
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const type = faker.helpers.arrayElement(['ROUND', 'ONEWAY'] as const);

      const commute = await db.commute.create({
        data: {
          date: addDays(today, dayOffset),
          seats: faker.number.int({ min: 1, max: 4 }),
          type,
          status: 'UNKNOWN',
          driverMemberId: driverMember.id,
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

        // Add the other seed member as a passenger on the first stop
        if (order === 0) {
          const otherMember = seedMembers.find((m) => m.id !== driverMember.id);
          if (otherMember) {
            await db.passengersOnStops.create({
              data: {
                tripType: type === 'ROUND' ? 'ROUND' : 'ONEWAY',
                status: 'ACCEPTED',
                passengerMemberId: otherMember.id,
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
