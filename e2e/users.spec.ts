import { expect, test } from 'e2e/utils';
import { ADMIN_FILE, USER_FILE } from 'e2e/utils/constants';
import { randomString } from 'remeda';

test.describe('User management as user', () => {
  test.use({ storageState: USER_FILE });

  test('Should not have access', async ({ usersPage }) => {
    await usersPage.goto();
    await usersPage.expectNoAccess();
  });
});

test.describe('User management as manager', () => {
  test.use({ storageState: ADMIN_FILE });

  test.beforeEach(async ({ usersPage }) => {
    await usersPage.goto();
    await usersPage.waitForUsersPage();
  });

  test('Create a user', async ({ usersPage }) => {
    await usersPage.newUserButton.click();
    await usersPage.waitForNewUserPage();

    const uniqueEmail = `new-user-${randomString(8)}@user.com`;
    await usersPage.nameInput.fill('New user');
    await usersPage.emailInput.fill(uniqueEmail);
    await usersPage.clickCreate();

    await usersPage.waitForUsersPage();
    await usersPage.searchInput.fill('new-user');
    await usersPage.expectUserVisible(uniqueEmail);
  });

  test('Edit a user', async ({ page, usersPage }) => {
    await usersPage.clickUser('admin@admin.com');
    await usersPage.clickEditUser();

    const newAdminName = `Admin ${randomString(8)}`;
    await usersPage.nameInput.fill(newAdminName);
    await usersPage.clickSave();

    await expect(page.getByText(newAdminName).first()).toBeVisible();
  });

  test('Delete a user', async ({ page, usersPage, confirmDialog }) => {
    await usersPage.clickUser('user', { exact: true });
    await usersPage.clickDelete();

    await expect(
      page.getByText('You are about to permanently delete this user.')
    ).toBeVisible();
    await confirmDialog.confirm();

    await usersPage.expectUserDeleted();
  });
});
