import { expect, type Page } from '@playwright/test';

export class BookingDrawer {
  constructor(private readonly page: Page) {}

  private get dialog() {
    return this.page.getByRole('dialog');
  }

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
