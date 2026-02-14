import { db } from '@/server/db';

import { createCommuteTemplates } from './commute-template';
import { createCommutes } from './commute';
import { createLocations } from './location';
import { createUsers } from './user';

async function main() {
  await createUsers();
  await createLocations();
  await createCommutes();
  await createCommuteTemplates();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
