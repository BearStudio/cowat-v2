import { db } from '@/server/db';

import { SEED_EMAILS } from './user';

export async function createCommuteTemplates(organizationId: string) {
  console.log(`⏳ Seeding commute templates`);

  const results = await Promise.all(
    SEED_EMAILS.map(async (email) => {
      const user = await db.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (!user) return { templates: 0, stops: 0 };

      const member = await db.member.findFirst({
        where: { userId: user.id, organizationId },
        select: { id: true },
      });
      if (!member) return { templates: 0, stops: 0 };

      const existingCount = await db.commuteTemplate.count({
        where: { driverMemberId: member.id },
      });
      if (existingCount > 0) return { templates: 0, stops: 0 };

      const locations = await db.location.findMany({
        where: { memberId: member.id },
        select: { id: true },
      });
      if (locations.length === 0) return { templates: 0, stops: 0 };

      const template = await db.commuteTemplate.create({
        data: {
          name: 'Daily commute',
          seats: 3,
          type: 'ROUND',
          driverMemberId: member.id,
        },
      });

      await Promise.all(
        locations.map((loc, order) =>
          db.templateStop.create({
            data: {
              order,
              outwardTime: '08:00',
              inwardTime: '18:00',
              templateId: template.id,
              locationId: loc.id,
            },
          })
        )
      );

      return { templates: 1, stops: locations.length };
    })
  );

  const templatesCreated = results.reduce((sum, r) => sum + r.templates, 0);
  const templateStopsCreated = results.reduce((sum, r) => sum + r.stops, 0);

  console.log(
    `✅ ${templatesCreated} templates, ${templateStopsCreated} template stops created`
  );
}
