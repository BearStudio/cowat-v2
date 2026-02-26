import { expect, test } from 'e2e/utils';
import { USER_FILE } from 'e2e/utils/constants';

test.describe.serial('Account settings', () => {
  test.use({ storageState: USER_FILE });

  test.beforeEach(async ({ accountPage }) => {
    await accountPage.goto();
    await expect(accountPage.heading).toBeVisible();
  });

  test('Update personal information', async ({ page, accountPage }) => {
    await accountPage.editNameButton.click();
    await expect(page.getByText('Update your name').first()).toBeVisible();

    await accountPage.nameInput.clear();
    await accountPage.nameInput.fill('Updated User');
    await accountPage.updateButton.click();

    await expect(page.getByText('Name updated').first()).toBeVisible();
    await accountPage.expectNameVisible('Updated User');
  });

  test('Enable auto-accept', async ({ page, accountPage }) => {
    const checkbox = accountPage.autoAcceptCheckbox;

    if (await checkbox.isChecked()) {
      await checkbox.click();
      await expect(page.getByText('Auto-accept updated').first()).toBeVisible();
    }

    await checkbox.click();
    await expect(page.getByText('Auto-accept updated').first()).toBeVisible();
    await expect(checkbox).toBeChecked();

    await accountPage.goto();
    await expect(accountPage.heading).toBeVisible();
    await expect(accountPage.autoAcceptCheckbox).toBeChecked();
  });

  test('Disable auto-accept', async ({ page, accountPage }) => {
    const checkbox = accountPage.autoAcceptCheckbox;

    if (!(await checkbox.isChecked())) {
      await checkbox.click();
      await expect(page.getByText('Auto-accept updated').first()).toBeVisible();
    }

    await checkbox.click();
    await expect(page.getByText('Auto-accept updated').first()).toBeVisible();
    await expect(checkbox).not.toBeChecked();
  });
});
