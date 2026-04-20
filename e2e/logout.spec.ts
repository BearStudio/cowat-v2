import { expect, test } from 'e2e/utils';
import { USER_EMAIL } from 'e2e/utils/constants';

import { LogoutPage } from './pages/logout.page';

test.describe('Logout flow', () => {
  test('should redirect to login and invalidate session after sign out', async ({
    page,
    loginPage,
    accountPage,
  }) => {
    await loginPage.goto();
    await page.login({ email: USER_EMAIL });
    await loginPage.expectAppLayout();

    await accountPage.goto();
    await expect(accountPage.heading).toBeVisible();

    const logoutPage = new LogoutPage(page);
    await logoutPage.logout();
    await logoutPage.expectLoginPage();
    await logoutPage.expectSessionInvalid();
  });
});
