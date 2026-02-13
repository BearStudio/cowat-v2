import { db } from '@/server/db';

import { createUsers } from './user';

async function main() {
  await createUsers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
