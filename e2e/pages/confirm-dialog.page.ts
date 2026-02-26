import { type Page } from '@playwright/test';

export class ConfirmDialog {
  constructor(private readonly page: Page) {}

  async confirm() {
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }
}
