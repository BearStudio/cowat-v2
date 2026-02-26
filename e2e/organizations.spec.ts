import { expect, test } from 'e2e/utils';
import { ADMIN_EMAIL, ADMIN_FILE, ORG_SLUG } from 'e2e/utils/constants';
import { randomString } from 'remeda';

test.describe.serial('Manager organization', () => {
  test.use({ storageState: ADMIN_FILE });

  test.beforeAll(async ({ browser }) => {
    // Restore the org name in case a previous run left it in a corrupted state.
    const ctx = await browser.newContext({ storageState: ADMIN_FILE });
    const page = await ctx.newPage();
    await page.goto(`/manager/${ORG_SLUG}/account`);
    await page.getByLabel('Name').waitFor({ timeout: 15_000 });
    await page.getByLabel('Name').fill('Default Organization');
    const saveButton = page.getByRole('button', { name: 'Save' });
    // Only click Save if the name actually changed (button is enabled when dirty).
    if (await saveButton.isEnabled({ timeout: 2_000 }).catch(() => false)) {
      await saveButton.click();
    }
    await ctx.close();
  });

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
