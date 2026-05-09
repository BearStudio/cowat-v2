import { db } from '@/server/db';

import { createCommutes } from './commute';
import { createCommuteTemplates } from './commute-template';
import { createLocations } from './location';
import { addOrgMembers, createOrg } from './organization';
import { createUsers } from './user';

async function main() {
  const [, orgId] = await Promise.all([createUsers(), createOrg()]);
  await Promise.all([addOrgMembers(orgId), createLocations(orgId)]);
  await Promise.all([createCommutes(orgId), createCommuteTemplates(orgId)]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
