import { db } from '@/server/db';

import { SEED_EMAILS } from './user';

const DEFAULT_ORG_SLUG = 'default';

export async function createOrganization() {
  console.log(`⏳ Seeding default organization`);

  let org = await db.organization.findUnique({
    where: { slug: DEFAULT_ORG_SLUG },
  });

  if (!org) {
    org = await db.organization.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Default Organization',
        slug: DEFAULT_ORG_SLUG,
        createdAt: new Date(),
      },
    });
    console.log(`✅ Default organization created`);
  } else {
    console.log(`✅ Default organization already exists`);
  }

  // Add seed users as members
  for (const email of SEED_EMAILS) {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) continue;

    const existingMember = await db.member.findFirst({
      where: { userId: user.id, organizationId: org.id },
    });
    if (existingMember) continue;

    await db.member.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        organizationId: org.id,
        role:
          email === 'admin@admin.com' || email === 'owner@owner.com'
            ? 'owner'
            : 'member',
        createdAt: new Date(),
      },
    });
  }

  return org.id;
}

export async function getDefaultOrgId(): Promise<string> {
  const org = await db.organization.findUnique({
    where: { slug: DEFAULT_ORG_SLUG },
  });
  if (!org)
    throw new Error(
      'Default organization not found. Run createOrganization first.'
    );
  return org.id;
}
