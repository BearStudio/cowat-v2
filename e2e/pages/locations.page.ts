import { expect, type Page } from '@playwright/test';

import { ORG_SLUG } from 'e2e/utils/constants';

export class LocationsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(`/app/${ORG_SLUG}/account/locations`);
    await this.page.getByTestId('layout-app').waitFor({ timeout: 15_000 });
  }

  get heading() {
    return this.page.getByText('Locations').first();
  }

  get newLocationButton() {
    return this.page.getByRole('button', { name: 'New Location' });
  }

  get nameInput() {
    return this.page.getByLabel('Name');
  }

  get addressInput() {
    return this.page.getByLabel('Address');
  }

  locationRow(name: string) {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  async clickCreate() {
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async clickSave() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async clickLocationName(name: string) {
    await this.locationRow(name).getByText(name).first().click();
  }

  async clickDeleteOnRow(locationName: string) {
    await this.locationRow(locationName)
      .getByRole('button', { name: 'Delete', exact: true })
      .click();
  }

  async expectLocationVisible(name: string) {
    const item = this.page.getByText(name).first();
    const loadMore = this.page.getByRole('button', { name: 'Load more' });
    await expect(async () => {
      if (await item.isVisible()) return;
      if ((await loadMore.isVisible()) && !(await loadMore.isDisabled())) {
        await loadMore.click();
      }
      await expect(item).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });
  }

  async expectLocationNotVisible(name: string) {
    await expect(this.page.getByText(name)).not.toBeVisible();
  }
}
