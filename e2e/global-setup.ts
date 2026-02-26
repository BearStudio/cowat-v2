import { execSync } from 'node:child_process';

export default function globalSetup() {
  console.log('🗑️  Resetting database…');
  execSync('pnpm db:reset', { stdio: 'inherit' });

  console.log('🌱 Seeding database…');
  execSync('pnpm db:seed', { stdio: 'inherit' });

  console.log('📅 Re-seeding commutes for the current week…');
  execSync('pnpm db:seed:week', { stdio: 'inherit' });
}
