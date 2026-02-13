import { faker } from '@faker-js/faker';

import { db } from '@/server/db';

const TARGET_TEMPLATES_PER_DRIVER = 1;
const STOPS_PER_TEMPLATE = 2;

export async function createCommuteTemplates() {
  console.log(`⏳ Seeding commute templates`);

  let templatesCreated = 0;
  let templateStopsCreated = 0;
  const existingTemplates = await db.commuteTemplate.count();

  const users = await db.user.findMany({ select: { id: true }, take: 20 });
  const locations = await db.location.findMany({ select: { id: true } });

  if (locations.length === 0) {
    console.log(`⚠️ No locations found, skipping commute templates`);
    return;
  }

  // Use first 8 users as drivers with templates
  const drivers = users.slice(0, Math.min(8, users.length));

  for (const driver of drivers) {
    const driverTemplateCount = await db.commuteTemplate.count({
      where: { driverId: driver.id },
    });

    for (
      let i = 0;
      i < Math.max(0, TARGET_TEMPLATES_PER_DRIVER - driverTemplateCount);
      i++
    ) {
      const type = faker.helpers.arrayElement(['ROUND', 'ONEWAY'] as const);

      const template = await db.commuteTemplate.create({
        data: {
          name: faker.helpers.arrayElement([
            'Daily commute',
            'Morning route',
            'Evening route',
            'Weekend trip',
          ]),
          seats: faker.number.int({ min: 1, max: 4 }),
          type,
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
      templatesCreated += 1;

      // Create template stops
      const stopLocations = faker.helpers.arrayElements(
        locations,
        Math.min(STOPS_PER_TEMPLATE, locations.length)
      );

      for (let order = 0; order < stopLocations.length; order++) {
        await db.templateStop.create({
          data: {
            order,
            templateId: template.id,
            locationId: stopLocations[order]!.id,
          },
        });
        templateStopsCreated += 1;
      }
    }
  }

  console.log(
    `✅ ${existingTemplates} existing templates 👉 ${templatesCreated} templates, ${templateStopsCreated} template stops created`
  );
}
