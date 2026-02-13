import { type Locator, type Page } from '@playwright/test';

export class LocationListPage {
  readonly page: Page;
  readonly newLocationButton: Locator;
  readonly deleteConfirmationMessage: Locator;
  readonly deletedToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newLocationButton = page.getByText('New Location');
    this.deleteConfirmationMessage = page.getByText(
      'You are about to delete this location.'
    );
    this.deletedToast = page.getByText('Location deleted');
  }

  async goto() {
    await this.page.goto('/app/account/locations');
  }

  async clickNewLocation() {
    await this.newLocationButton.click();
    await this.page.waitForURL('/app/account/locations/new');
  }

  async clickLocation(name: string) {
    await this.page.getByText(name, { exact: false }).first().click({
      force: true,
    });
  }

  async deleteLocation(name: string) {
    await this.page
      .getByRole('row', { name })
      .getByRole('button', { name: 'Delete' })
      .click();
  }

  async confirmDelete() {
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }

  getLocationByName(name: string): Locator {
    return this.page.getByText(name);
  }
}
