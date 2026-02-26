import { expect, type Page } from '@playwright/test';

export class BookingDrawer {
  private readonly dialog = this.page.getByRole('dialog');

  constructor(private readonly page: Page) {}

  async expectOpen() {
    await expect(
      this.dialog.getByRole('heading', { name: 'Book a ride' })
    ).toBeVisible();
  }

  async submit() {
    await this.dialog.getByRole('button', { name: 'Book' }).click();
  }
}
