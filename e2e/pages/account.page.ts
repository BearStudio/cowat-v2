import { expect, type Page } from '@playwright/test';
import { ORG_SLUG } from 'e2e/utils/constants';

export class AccountPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(`/app/${ORG_SLUG}/account`);
    await this.page.waitForLoadState('load');
  }

  get heading() {
    return this.page.locator('[data-testid="layout-app"]');
  }

  get editNameButton() {
    return this.page.getByRole('button', { name: 'Update your name' });
  }

  get nameInput() {
    return this.page
      .getByRole('dialog', { name: 'Update your name' })
      .getByRole('textbox');
  }

  get updateButton() {
    return this.page.getByRole('button', { name: 'Update' });
  }

  get autoAcceptCheckbox() {
    return this.page.getByRole('checkbox', {
      name: 'Automatically accept ride requests',
    });
  }

  async expectNameVisible(name: string) {
    await expect(this.page.getByText(name).first()).toBeVisible();
  }
}
