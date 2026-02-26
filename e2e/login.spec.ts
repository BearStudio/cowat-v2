import { test } from 'e2e/utils';
import { ADMIN_EMAIL, USER_EMAIL } from 'e2e/utils/constants';

test.describe('Login flow', () => {
  test('Login as admin', async ({ page, loginPage }) => {
    await loginPage.goto();
    await page.login({ email: ADMIN_EMAIL });
    await loginPage.expectAppLayout();
  });

  test('Login as user', async ({ page, loginPage }) => {
    await loginPage.goto();
    await page.login({ email: USER_EMAIL });
    await loginPage.expectAppLayout();
  });

  test('Login with redirect', async ({ page, loginPage }) => {
    await page.to('/app');
    await page.login({ email: ADMIN_EMAIL });
    await loginPage.expectAppLayout();
  });
});
