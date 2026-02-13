import { faker } from '@faker-js/faker';

import { db } from '@/server/db';

const TARGET_COMMUTES_PER_DRIVER = 2;
const STOPS_PER_COMMUTE = 3;

export async function createCommutes() {
  console.log(`⏳ Seeding commutes, stops, and passenger bookings`);

  let commutesCreated = 0;
  let stopsCreated = 0;
  let bookingsCreated = 0;
  const existingCommutes = await db.commute.count();

  const users = await db.user.findMany({ select: { id: true }, take: 20 });
  const locations = await db.location.findMany({ select: { id: true } });

  if (locations.length === 0) {
    console.log(`⚠️ No locations found, skipping commutes`);
    return;
  }

  // Use first 10 users as drivers
  const drivers = users.slice(0, Math.min(10, users.length));

  for (const driver of drivers) {
    const driverCommuteCount = await db.commute.count({
      where: { driverId: driver.id },
    });

    for (
      let i = 0;
      i < Math.max(0, TARGET_COMMUTES_PER_DRIVER - driverCommuteCount);
      i++
    ) {
      const type = faker.helpers.arrayElement(['ROUND', 'ONEWAY'] as const);
      const seats = faker.number.int({ min: 1, max: 4 });

      const commute = await db.commute.create({
        data: {
          date: faker.date.soon({ days: 14 }),
          seats,
          type,
          status: faker.helpers.arrayElement(['UNKNOWN', 'ON_TIME'] as const),
          outwardTime: `${faker.number.int({ min: 6, max: 9 }).toString().padStart(2, '0')}:${faker.helpers.arrayElement(['00', '15', '30', '45'])}`,
          inwardTime:
            type === 'ROUND'
              ? `${faker.number.int({ min: 16, max: 19 }).toString().padStart(2, '0')}:${faker.helpers.arrayElement(['00', '15', '30', '45'])}`
              : null,
          comment: faker.helpers.maybe(() => faker.lorem.sentence(), {
            probability: 0.3,
          }),
          driverId: driver.id,
        },
      });
      commutesCreated += 1;

      // Create stops per commute
      const stopLocations = faker.helpers.arrayElements(
        locations,
        Math.min(STOPS_PER_COMMUTE, locations.length)
      );

      const stops = [];
      for (let order = 0; order < stopLocations.length; order++) {
        const stop = await db.stop.create({
          data: {
            order,
            time: `${faker.number.int({ min: 6, max: 10 }).toString().padStart(2, '0')}:${faker.helpers.arrayElement(['00', '15', '30', '45'])}`,
            commuteId: commute.id,
            locationId: stopLocations[order]!.id,
          },
        });
        stops.push(stop);
        stopsCreated += 1;
      }

      // Add passenger bookings on some stops
      const passengers = users
        .filter((u) => u.id !== driver.id)
        .slice(0, Math.min(seats, 3));

      for (const passenger of passengers) {
        const stop = faker.helpers.arrayElement(stops);
        const exists = await db.passengersOnStops.findUnique({
          where: {
            passengerId_stopId: {
              passengerId: passenger.id,
              stopId: stop.id,
            },
          },
        });
        if (exists) continue;

        await db.passengersOnStops.create({
          data: {
            tripType: faker.helpers.arrayElement([
              'ROUND',
              'ONEWAY',
              'RETURN',
            ] as const),
            status: faker.helpers.arrayElement([
              'REQUESTED',
              'ACCEPTED',
            ] as const),
            passengerId: passenger.id,
            stopId: stop.id,
          },
        });
        bookingsCreated += 1;
      }
    }
  }

  console.log(
    `✅ ${existingCommutes} existing commutes 👉 ${commutesCreated} commutes, ${stopsCreated} stops, ${bookingsCreated} bookings created`
  );
}
