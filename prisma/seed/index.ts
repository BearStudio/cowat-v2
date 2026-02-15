import { db } from '@/server/db';

import { createCommutes } from './commute';
import { createCommuteTemplates } from './commute-template';
import { createLocations } from './location';
import { createOrganization } from './organization';
import { createUsers } from './user';

async function main() {
  await createUsers();
  const orgId = await createOrganization();
  await createLocations(orgId);
  await createCommutes(orgId);
  await createCommuteTemplates(orgId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
