import { expect, test } from 'e2e/utils';
import { USER_FILE } from 'e2e/utils/constants';
import { randomString } from 'remeda';

import { LocationFormPage } from './models/location-form.page';
import { LocationListPage } from './models/location-list.page';

test.describe('Location management', () => {
  test.use({ storageState: USER_FILE });

  test('Create a location', async ({ page }) => {
    const listPage = new LocationListPage(page);
    const formPage = new LocationFormPage(page);

    const randomId = randomString(8);
    const uniqueName = `Location ${randomId}`;

    await listPage.goto();
    await listPage.clickNewLocation();

    await formPage.fillForm({ name: uniqueName, address: '123 Main St' });
    await formPage.create();

    await page.waitForURL('/app/account/locations');
    await expect(listPage.getLocationByName(uniqueName)).toBeVisible();
  });

  test('Edit a location', async ({ page }) => {
    const listPage = new LocationListPage(page);
    const formPage = new LocationFormPage(page);

    const randomId = randomString(8);
    const newName = `Updated Location ${randomId}`;

    await listPage.goto();
    await listPage.clickLocation('Location');

    await formPage.fillForm({ name: newName });
    await formPage.save();

    await page.waitForURL('/app/account/locations');
    await expect(listPage.getLocationByName(newName)).toBeVisible();
  });

  test('Delete a location', async ({ page }) => {
    const listPage = new LocationListPage(page);

    await listPage.goto();
    await listPage.deleteLocation('Location');

    await expect(listPage.deleteConfirmationMessage).toBeVisible();

    await listPage.confirmDelete();
    await expect(listPage.deletedToast).toBeVisible();
  });
});
