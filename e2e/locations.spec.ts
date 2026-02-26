import { expect, test } from 'e2e/utils';
import { USER_FILE } from 'e2e/utils/constants';

test.describe('Location management', () => {
  test.use({ storageState: USER_FILE });

  test.beforeEach(async ({ locationsPage }) => {
    await locationsPage.goto();
    await expect(locationsPage.heading).toBeVisible();
  });

  test('6.1 — Create a new location', async ({ page, locationsPage }) => {
    await locationsPage.newLocationButton.click();
    await expect(page.getByText('New Location').first()).toBeVisible();

    await locationsPage.nameInput.fill('Home - Test');
    await locationsPage.addressInput.fill('1 Rue de la Paix, Paris');
    await locationsPage.clickCreate();

    await expect(page.getByText('Location created').first()).toBeVisible();
    await locationsPage.expectLocationVisible('Home - Test');
  });

  test('6.2 — Edit an existing location', async ({ page, locationsPage }) => {
    await locationsPage.clickLocationName('Home');
    await expect(page.getByText('Edit Location').first()).toBeVisible();

    await locationsPage.nameInput.clear();
    await locationsPage.nameInput.fill('Home - Updated');
    await locationsPage.clickSave();

    await expect(page.getByText('Location updated').first()).toBeVisible();
    await locationsPage.expectLocationVisible('Home - Updated');
  });

  test('6.3 — Delete a location', async ({
    page,
    locationsPage,
    confirmDialog,
  }) => {
    // Create a location to delete so the test is self-contained
    await locationsPage.newLocationButton.click();
    await locationsPage.nameInput.fill('To Delete');
    await locationsPage.addressInput.fill('123 Test Street, Paris');
    await locationsPage.clickCreate();
    await expect(page.getByText('Location created').first()).toBeVisible();

    await locationsPage.clickDeleteOnRow('To Delete');
    await expect(
      page.getByText('You are about to delete this location.').first()
    ).toBeVisible();
    await confirmDialog.confirm();

    await expect(page.getByText('Location deleted').first()).toBeVisible();
    await locationsPage.expectLocationNotVisible('To Delete');
  });
});
