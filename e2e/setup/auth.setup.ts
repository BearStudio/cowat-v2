import { expect } from '@playwright/test';
import { test as setup } from 'e2e/utils';
import {
  ADMIN_EMAIL,
  ADMIN_FILE,
  INVITED_EMAIL,
  INVITED_FILE,
  USER_EMAIL,
  USER_FILE,
} from 'e2e/utils/constants';

import { OWNER_EMAIL, OWNER_FILE } from '../utils/constants';

/**
 * @see https://playwright.dev/docs/auth#multiple-signed-in-roles
 */

setup('authenticate as admin', async ({ page }) => {
  await page.to('/login');
  await page.login({ email: ADMIN_EMAIL });

  await page.waitForURL('/app');
  await expect(page.getByTestId('layout-app')).toBeVisible();

  await page.context().storageState({ path: ADMIN_FILE });
});

setup('authenticate as owner', async ({ page }) => {
  await page.to('/login');
  await page.login({ email: OWNER_EMAIL });

  await page.waitForURL('/app');
  await expect(page.getByTestId('layout-app')).toBeVisible();

  await page.context().storageState({ path: OWNER_FILE });
});

setup('authenticate as user', async ({ page }) => {
  await page.to('/login');
  await page.login({ email: USER_EMAIL });

  await page.waitForURL('/app');
  await expect(page.getByTestId('layout-app')).toBeVisible();

  await page.context().storageState({ path: USER_FILE });
});

setup('authenticate as invited user', async ({ page }) => {
  await page.to('/login');
  await page.login({ email: INVITED_EMAIL });

  await page.waitForURL('/app');

  // New users land on an onboarding screen inside the app route (no onboardedAt).
  // Complete it so the saved storage state reflects a fully onboarded user.
  try {
    await page
      .getByRole('heading', { name: 'Welcome' })
      .waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('textbox').first().fill('Invited User');
    await page.getByRole('button', { name: 'Continue' }).click();
  } catch {
    // Already onboarded on a subsequent run — nothing to do.
  }

  // After a fresh DB reset this user has no org membership, so layout-app
  // won't render. We just need valid auth cookies for the invitation test.
  await page.waitForLoadState('load');

  await page.context().storageState({ path: INVITED_FILE });
});
