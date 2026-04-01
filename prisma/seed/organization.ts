import { db } from '@/server/db';

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

  // Add ALL users as members of the default org
  const allUsers = await db.user.findMany({
    select: { id: true, email: true },
  });
  for (const user of allUsers) {
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
          user.email === 'admin@admin.com' || user.email === 'owner@owner.com'
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
