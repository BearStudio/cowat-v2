import { type Page } from '@playwright/test';

export class ConfirmDialog {
  constructor(private readonly page: Page) {}

  async confirm(buttonName = 'Confirm') {
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: buttonName })
      .click();
  }
}
