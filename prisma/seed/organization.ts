import { db } from '@/server/db';

const DEFAULT_ORG_SLUG = 'default';

export async function createOrg(): Promise<string> {
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

  return org.id;
}

export async function addOrgMembers(orgId: string): Promise<void> {
  const allUsers = await db.user.findMany({
    select: { id: true, email: true },
  });
  await Promise.all(
    allUsers.map(async (user) => {
      const existingMember = await db.member.findFirst({
        where: { userId: user.id, organizationId: orgId },
      });
      if (existingMember) return;

      await db.member.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          organizationId: orgId,
          role:
            user.email === 'admin@admin.com' || user.email === 'owner@owner.com'
              ? 'owner'
              : 'member',
          createdAt: new Date(),
        },
      });
    })
  );
}

export async function createOrganization(): Promise<string> {
  const orgId = await createOrg();
  await addOrgMembers(orgId);
  return orgId;
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
