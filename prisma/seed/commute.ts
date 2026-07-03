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

/** Shape of a generated trip on the day timeline:
 *  - SAME_DAY:          outward in the morning, return the same afternoon.
 *  - RETURN_NEXT_DAY:   outward in the morning, return early the *next* day.
 *  - OVERNIGHT_OUTWARD: the outward leg itself crosses midnight, so its stops
 *                       are spread over two days. */
type TripShape = 'SAME_DAY' | 'RETURN_NEXT_DAY' | 'OVERNIGHT_OUTWARD';

/** Generate stop times for both outward and inward trips.
 *
 *  Stops carry no date of their own — the app infers a day offset whenever a
 *  time "wraps" before the previous one (see `isNextDay`). We exploit that to
 *  produce multi-day commutes purely through the HH:mm values.
 *
 *  Outward times are ascending by index (the route runs stop 0 → last stop).
 *  The return drives the reverse route, departing from the last stop, so inward
 *  times are *descending* by index — the last stop has the earliest inward
 *  time, stop 0 the latest. */
function generateStopTimes(
  stopCount: number,
  type: 'ROUND' | 'ONEWAY',
  shape: TripShape = 'SAME_DAY'
): Array<{ outwardTime: string; inwardTime: string | null }> {
  const quarters = ['00', '15', '30', '45'] as const;

  // Format a quarter-hour count (from midnight of the commute date) as HH:mm,
  // wrapping past 24h so a leg crossing midnight yields a valid wall clock.
  const fmt = (totalQuarters: number): string => {
    const h = Math.floor(totalQuarters / 4) % 24;
    const q = ((totalQuarters % 4) + 4) % 4;
    return `${h.toString().padStart(2, '0')}:${quarters[q]}`;
  };

  // Outward start (in quarter-hours). OVERNIGHT_OUTWARD anchors the LAST stop
  // at 00:00 (next day) so the outward leg always crosses midnight, whatever
  // the stop count.
  const outwardStartQuarter =
    shape === 'OVERNIGHT_OUTWARD'
      ? 24 * 4 - (stopCount - 1)
      : faker.number.int({ min: 6, max: 9 }) * 4 +
        faker.number.int({ min: 0, max: 2 });

  const lastOutwardQuarter = outwardStartQuarter + (stopCount - 1);

  // Inward time of the LAST stop (the return departs from there first).
  // RETURN_NEXT_DAY pushes it to ~05:00–06:00 the following day, so its clock
  // value sits before the last outward arrival and is read as the next day.
  const inwardBaseQuarter =
    shape === 'RETURN_NEXT_DAY'
      ? 24 * 4 + faker.number.int({ min: 5 * 4, max: 6 * 4 })
      : lastOutwardQuarter + 6 * 4;

  return Array.from({ length: stopCount }, (_, i) => ({
    // Outward ascending by index: each stop is 15min later.
    outwardTime: fmt(outwardStartQuarter + i),
    // Inward descending by index: the last stop leaves first, each
    // earlier-indexed stop is 15min later.
    inwardTime:
      type === 'ROUND' ? fmt(inwardBaseQuarter + (stopCount - 1 - i)) : null,
  }));
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
  // Spread commutes over a week so the dashboard shows trips on several days.
  const COMMUTE_DAYS = 7;

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
          // Day 1 is a "return next day" round trip and day 2 an overnight
          // outward leg (stops spread over two days), so every driver exercises
          // both multi-day cases. Day 0 stays a same-day trip (it carries the
          // seeded passenger booking) and the rest are random same-day trips.
          let shape: TripShape;
          let type: 'ROUND' | 'ONEWAY';
          if (dayOffset === 1) {
            shape = 'RETURN_NEXT_DAY';
            type = 'ROUND';
          } else if (dayOffset === 2) {
            shape = 'OVERNIGHT_OUTWARD';
            type = 'ROUND';
          } else {
            shape = 'SAME_DAY';
            type = faker.helpers.arrayElement(['ROUND', 'ONEWAY'] as const);
          }
          const stopTimes = generateStopTimes(locations.length, type, shape);

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
