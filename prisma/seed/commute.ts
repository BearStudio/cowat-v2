import { faker } from '@faker-js/faker';

import { db } from '@/server/db';

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

/** Generate ascending stop times for both outward and inward trips.
 *  Outward times are ascending (morning), inward times are also ascending
 *  (afternoon) and always start after the last outward arrival. */
function generateStopTimes(
  stopCount: number,
  type: 'ROUND' | 'ONEWAY'
): Array<{ outwardTime: string; inwardTime: string | null }> {
  const quarters = ['00', '15', '30', '45'] as const;

  // Outward: pick a base hour then increment by 15min per stop
  const outwardBaseHour = faker.number.int({ min: 6, max: 9 });
  const outwardBaseQuarter = faker.number.int({ min: 0, max: 2 });

  // Last outward quarter (for the last stop)
  const lastOutwardQuarter =
    outwardBaseHour * 4 + outwardBaseQuarter + (stopCount - 1);

  // Inward base starts at least 6 hours after the last outward time
  const inwardBaseQuarter = lastOutwardQuarter + 6 * 4;
  const inwardBaseHour = Math.floor(inwardBaseQuarter / 4);
  const inwardBaseQ = inwardBaseQuarter % 4;

  return Array.from({ length: stopCount }, (_, i) => {
    // Outward times ascending: each stop is 15min later
    const outTotalQuarters = outwardBaseHour * 4 + outwardBaseQuarter + i;
    const outH = Math.floor(outTotalQuarters / 4);
    const outQ = outTotalQuarters % 4;

    // Inward times ascending: each stop is 15min later (same order as outward)
    const inTotalQuarters = inwardBaseHour * 4 + inwardBaseQ + i;
    const inH = Math.floor(inTotalQuarters / 4);
    const inQ = inTotalQuarters % 4;

    return {
      outwardTime: `${outH.toString().padStart(2, '0')}:${quarters[outQ]}`,
      inwardTime:
        type === 'ROUND'
          ? `${inH.toString().padStart(2, '0')}:${quarters[inQ]}`
          : null,
    };
  });
}

export async function createCommutes(organizationId: string) {
  console.log(
    `⏳ Seeding commutes, stops, passenger bookings, and commute requests`
  );

  let commutesCreated = 0;
  let stopsCreated = 0;
  let bookingsCreated = 0;
  let requestsCreated = 0;

  const seedMembers = await db.member.findMany({
    where: { organizationId },
    select: { id: true, userId: true },
  });

  const today = getToday();
  const COMMUTE_DAYS = 2;

  for (const driverMember of seedMembers) {
    const locations = await db.location.findMany({
      where: { memberId: driverMember.id },
      select: { id: true },
    });
    if (locations.length === 0) continue;

    // If commutes already exist, refresh their dates so they always cover
    // today → today+(COMMUTE_DAYS-1).
    const existingCommutes = await db.commute.findMany({
      where: { driverMemberId: driverMember.id },
      select: { id: true },
      orderBy: { date: 'asc' },
    });
    if (existingCommutes.length > 0) {
      for (let i = 0; i < existingCommutes.length; i++) {
        await db.commute.update({
          where: { id: existingCommutes[i]!.id },
          data: { date: addDays(today, i % COMMUTE_DAYS) },
        });
      }
      commutesCreated += existingCommutes.length;
      continue;
    }

    for (let dayOffset = 0; dayOffset < COMMUTE_DAYS; dayOffset++) {
      const type = faker.helpers.arrayElement(['ROUND', 'ONEWAY'] as const);
      const stopTimes = generateStopTimes(locations.length, type);

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

      for (let order = 0; order < locations.length; order++) {
        const stop = await db.stop.create({
          data: {
            order,
            outwardTime: stopTimes[order]!.outwardTime,
            inwardTime: stopTimes[order]!.inwardTime,
            commuteId: commute.id,
            locationId: locations[order]!.id,
          },
        });
        stopsCreated += 1;

        // Add a passenger booking on the first day only
        if (order === 0 && dayOffset === 0) {
          const otherMember = seedMembers.find((m) => m.id !== driverMember.id);
          if (otherMember) {
            await db.passengersOnStops.create({
              data: {
                tripType: type === 'ROUND' ? 'ROUND' : 'ONEWAY',
                status: 'REQUESTED',
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

  // --- Commute requests ---
  // Create a few commute requests from non-driver members
  for (const member of seedMembers) {
    const existingRequests = await db.commuteRequest.count({
      where: { requesterMemberId: member.id },
    });
    if (existingRequests > 0) continue;

    // One OPEN request for tomorrow
    await db.commuteRequest.create({
      data: {
        date: addDays(today, 1),
        destination: 'Office',
        comment: 'Looking for a ride tomorrow morning',
        status: 'OPEN',
        requesterMemberId: member.id,
      },
    });
    requestsCreated += 1;

    // One FULFILLED request linked to an existing commute (if any)
    const existingCommute = await db.commute.findFirst({
      where: {
        driverMemberId: { not: member.id },
        date: addDays(today, 0),
      },
      select: { id: true },
    });
    if (existingCommute) {
      await db.commuteRequest.create({
        data: {
          date: addDays(today, 0),
          destination: 'Office',
          status: 'FULFILLED',
          requesterMemberId: member.id,
          commuteId: existingCommute.id,
        },
      });
      requestsCreated += 1;
    }
  }

  console.log(
    `✅ ${commutesCreated} commutes, ${stopsCreated} stops, ${bookingsCreated} bookings, ${requestsCreated} commute requests created`
  );
}
