import { expect, test } from 'e2e/utils';
import { USER_FILE } from 'e2e/utils/constants';
import { randomString } from 'remeda';

test.describe('Location management', () => {
  test.use({ storageState: USER_FILE });

  test.beforeEach(async ({ locationsPage }) => {
    await locationsPage.goto();
    await expect(locationsPage.heading).toBeVisible();
  });

  test('Create a new location', async ({ page, locationsPage }) => {
    const name = `Home - Test ${randomString(6)}`;

    await locationsPage.newLocationButton.click();
    await expect(page.getByText('New Location').first()).toBeVisible();

    await locationsPage.nameInput.fill(name);
    await locationsPage.addressInput.fill('1 Rue de la Paix, Paris');
    await locationsPage.clickCreate();

    await expect(page.getByText('Location created').first()).toBeVisible();
    await locationsPage.expectLocationVisible(name);
  });

  test('Edit an existing location', async ({ page, locationsPage }) => {
    const originalName = `Edit Me ${randomString(6)}`;
    const updatedName = `${originalName} - Updated`;

    await locationsPage.newLocationButton.click();
    await locationsPage.nameInput.fill(originalName);
    await locationsPage.addressInput.fill('1 Rue de la Paix, Paris');
    await locationsPage.clickCreate();
    await expect(page.getByText('Location created').first()).toBeVisible();

    await locationsPage.clickLocationName(originalName);
    await expect(page.getByText('Edit Location').first()).toBeVisible();

    await locationsPage.nameInput.clear();
    await locationsPage.nameInput.fill(updatedName);
    await locationsPage.clickSave();

    await expect(page.getByText('Location updated').first()).toBeVisible();
    await locationsPage.expectLocationVisible(updatedName);
  });

  test('Delete a location', async ({ page, locationsPage, confirmDialog }) => {
    const name = `To Delete ${randomString(6)}`;

    await locationsPage.newLocationButton.click();
    await locationsPage.nameInput.fill(name);
    await locationsPage.addressInput.fill('123 Test Street, Paris');
    await locationsPage.clickCreate();
    await expect(page.getByText('Location created').first()).toBeVisible();
    await locationsPage.expectLocationVisible(name);

    await locationsPage.clickDeleteOnRow(name);
    await expect(
      page.getByText('You are about to delete this location.').first()
    ).toBeVisible();
    await confirmDialog.confirm('Delete');

    await expect(page.getByText('Location deleted').first()).toBeVisible();
    await locationsPage.expectLocationNotVisible(name);
  });
});
