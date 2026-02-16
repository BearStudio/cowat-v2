import { db } from '@/server/db';

import { SEED_EMAILS } from './user';

export async function createCommuteTemplates(organizationId: string) {
  console.log(`⏳ Seeding commute templates`);

  let templatesCreated = 0;
  let templateStopsCreated = 0;

  for (const email of SEED_EMAILS) {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) continue;

    const member = await db.member.findFirst({
      where: { userId: user.id, organizationId },
      select: { id: true },
    });
    if (!member) continue;

    const existingCount = await db.commuteTemplate.count({
      where: { driverMemberId: member.id },
    });
    if (existingCount > 0) continue;

    const locations = await db.location.findMany({
      where: { memberId: member.id },
      select: { id: true },
    });
    if (locations.length === 0) continue;

    const template = await db.commuteTemplate.create({
      data: {
        name: 'Daily commute',
        seats: 3,
        type: 'ROUND',
        driverMemberId: member.id,
      },
    });
    templatesCreated += 1;

    for (let order = 0; order < locations.length; order++) {
      await db.templateStop.create({
        data: {
          order,
          outwardTime: '08:00',
          inwardTime: '18:00',
          templateId: template.id,
          locationId: locations[order]!.id,
        },
      });
      templateStopsCreated += 1;
    }
  }

  console.log(
    `✅ ${templatesCreated} templates, ${templateStopsCreated} template stops created`
  );
}
