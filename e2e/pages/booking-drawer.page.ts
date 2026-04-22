import { expect, type Page } from '@playwright/test';

export class BookingDrawer {
  private readonly dialog = this.page.getByRole('dialog');

  constructor(private readonly page: Page) {}

  async expectOpen() {
    await expect(
      this.dialog.getByRole('heading', { name: 'Book a ride' })
    ).toBeVisible();
  }

  async selectTripType(type: 'ROUND' | 'ONEWAY' | 'RETURN') {
    const radio = this.dialog.locator(`input[type="radio"][value="${type}"]`);
    if ((await radio.count()) === 0) return;
    await radio.evaluate((element) => (element as HTMLElement).click());
  }

  async submit() {
    await this.dialog.getByRole('button', { name: 'Book' }).click();
  }
}
