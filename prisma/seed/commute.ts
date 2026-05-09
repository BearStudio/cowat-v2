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

  // Pre-fetch locations and existing commutes for all members in parallel
  const memberData = await Promise.all(
    seedMembers.map(async (driverMember) => {
      const [locations, existingCommutes] = await Promise.all([
        db.location.findMany({
          where: { memberId: driverMember.id },
          select: { id: true },
        }),
        db.commute.findMany({
          where: { driverMemberId: driverMember.id },
          select: { id: true },
          orderBy: { date: 'asc' },
        }),
      ]);
      return { driverMember, locations, existingCommutes };
    })
  );

  const otherMemberByDriverId = new Map(
    seedMembers.map((driver) => [
      driver.id,
      seedMembers.find((m) => m.id !== driver.id),
    ])
  );

  const memberResults = await Promise.all(
    memberData.map(async ({ driverMember, locations, existingCommutes }) => {
      if (locations.length === 0) return { commutes: 0, stops: 0, bookings: 0 };

      const otherMember = otherMemberByDriverId.get(driverMember.id);

      // If commutes already exist, refresh their dates so they always cover
      // today → today+(COMMUTE_DAYS-1).
      if (existingCommutes.length > 0) {
        await Promise.all(
          existingCommutes.map((c, i) =>
            db.commute.update({
              where: { id: c.id },
              data: { date: addDays(today, i % COMMUTE_DAYS) },
            })
          )
        );
        return { commutes: existingCommutes.length, stops: 0, bookings: 0 };
      }

      // Create all commutes for all day offsets in parallel
      const dayResults = await Promise.all(
        Array.from({ length: COMMUTE_DAYS }, async (_, dayOffset) => {
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

          // Create all stops for this commute in parallel
          const stops = await Promise.all(
            locations.map((loc, order) =>
              db.stop.create({
                data: {
                  order,
                  outwardTime: stopTimes[order]!.outwardTime,
                  inwardTime: stopTimes[order]!.inwardTime,
                  commuteId: commute.id,
                  locationId: loc.id,
                },
              })
            )
          );

          return { type, stops };
        })
      );

      // Add a passenger booking on the first stop of the first day only
      const firstDay = dayResults[0];
      let bookings = 0;
      if (firstDay && otherMember) {
        await db.passengersOnStops.create({
          data: {
            tripType: firstDay.type === 'ROUND' ? 'ROUND' : 'ONEWAY',
            status: 'REQUESTED',
            passengerMemberId: otherMember.id,
            stopId: firstDay.stops[0]!.id,
          },
        });
        bookings = 1;
      }

      return {
        commutes: dayResults.length,
        stops: dayResults.reduce((sum, { stops }) => sum + stops.length, 0),
        bookings,
      };
    })
  );

  commutesCreated += memberResults.reduce((sum, r) => sum + r.commutes, 0);
  stopsCreated += memberResults.reduce((sum, r) => sum + r.stops, 0);
  bookingsCreated += memberResults.reduce((sum, r) => sum + r.bookings, 0);

  // --- Commute requests ---
  // Create a few commute requests from non-driver members
  const requestCounts = await Promise.all(
    seedMembers.map(async (member) => {
      const existingRequests = await db.commuteRequest.count({
        where: { requesterMemberId: member.id },
      });
      if (existingRequests > 0) return 0;

      // Start OPEN request and commute lookup in parallel; defer awaiting
      // the create until after we inspect the lookup result
      const openRequestPromise = db.commuteRequest.create({
        data: {
          date: addDays(today, 1),
          destination: 'Office',
          comment: 'Looking for a ride tomorrow morning',
          status: 'OPEN',
          requesterMemberId: member.id,
        },
      });
      const existingCommute = await db.commute.findFirst({
        where: { driverMemberId: { not: member.id }, date: addDays(today, 0) },
        select: { id: true },
      });

      if (existingCommute) {
        await Promise.all([
          openRequestPromise,
          db.commuteRequest.create({
            data: {
              date: addDays(today, 0),
              destination: 'Office',
              status: 'FULFILLED',
              requesterMemberId: member.id,
              commuteId: existingCommute.id,
            },
          }),
        ]);
        return 2;
      }
      await openRequestPromise;
      return 1;
    })
  );
  requestsCreated += requestCounts.reduce((sum, n) => sum + n, 0);

  console.log(
    `✅ ${commutesCreated} commutes, ${stopsCreated} stops, ${bookingsCreated} bookings, ${requestsCreated} commute requests created`
  );
}
