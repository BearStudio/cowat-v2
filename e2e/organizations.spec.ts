import { expect, test } from 'e2e/utils';
import { ADMIN_EMAIL, ADMIN_FILE } from 'e2e/utils/constants';
import { randomString } from 'remeda';

test.describe.serial('Manager organization', () => {
  test.use({ storageState: ADMIN_FILE });

  test('View organization details', async ({ page, managerOrgPage }) => {
    await managerOrgPage.gotoOrgDashboard();

    await expect(page.locator('[data-testid="layout-manager"]')).toBeVisible();

    await managerOrgPage.expectOrgNameVisible('Default Organization');
    await managerOrgPage.expectMembersSectionVisible();
    await managerOrgPage.expectMemberRowVisible({ email: ADMIN_EMAIL });
    await managerOrgPage.expectPendingInvitationsSectionVisible();
  });

  test('Update organization settings', async ({ page, managerOrgPage }) => {
    await managerOrgPage.gotoAccount();

    await expect(managerOrgPage.orgSettingsCard).toBeVisible();

    const newName = `Default Organization ${randomString(6)}`;

    await managerOrgPage.nameInput.fill(newName);
    await managerOrgPage.saveButton.click();

    await expect(page.getByText('Organization updated').first()).toBeVisible();

    // Restore original name
    await managerOrgPage.nameInput.fill('Default Organization');
    await managerOrgPage.saveButton.click();
    await expect(page.getByText('Organization updated').first()).toBeVisible();
  });
});
