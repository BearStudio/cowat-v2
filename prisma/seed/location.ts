import { db } from '@/server/db';

const LOCATIONS = [
  {
    name: 'Home',
    address: '12 rue de la Paix, 75002 Paris',
    latitude: 48.8698,
    longitude: 2.3302,
  },
  {
    name: 'Office',
    address: '1 avenue des Champs-Élysées, 75008 Paris',
    latitude: 48.8656,
    longitude: 2.311,
  },
  {
    name: 'Station',
    address: 'Gare de Lyon, 75012 Paris',
    latitude: 48.8443,
    longitude: 2.3744,
  },
] as const;

export async function createLocations(organizationId: string) {
  console.log(`⏳ Seeding locations`);

  let createdCounter = 0;

  const members = await db.member.findMany({
    where: { organizationId },
    select: { id: true },
  });

  for (const member of members) {
    const existingCount = await db.location.count({
      where: { memberId: member.id },
    });
    if (existingCount > 0) continue;

    for (const loc of LOCATIONS) {
      await db.location.create({
        data: { ...loc, memberId: member.id },
      });
      createdCounter += 1;
    }
  }

  console.log(`✅ ${createdCounter} locations created`);
}
