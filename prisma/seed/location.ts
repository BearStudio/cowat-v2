import { faker } from '@faker-js/faker';

import { db } from '@/server/db';

const TARGET_LOCATIONS_PER_USER = 2;

export async function createLocations() {
  console.log(`⏳ Seeding locations`);

  let createdCounter = 0;
  const existingCount = await db.location.count();

  const users = await db.user.findMany({ select: { id: true }, take: 20 });

  for (const user of users) {
    const userLocationCount = await db.location.count({
      where: { userId: user.id },
    });

    for (
      let i = 0;
      i < Math.max(0, TARGET_LOCATIONS_PER_USER - userLocationCount);
      i++
    ) {
      await db.location.create({
        data: {
          name: faker.helpers.arrayElement([
            'Home',
            'Office',
            'Station',
            'University',
            'Gym',
          ]),
          address: faker.location.streetAddress({ useFullAddress: true }),
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
          userId: user.id,
        },
      });
      createdCounter += 1;
    }
  }

  console.log(
    `✅ ${existingCount} existing locations 👉 ${createdCounter} locations created`
  );
}
