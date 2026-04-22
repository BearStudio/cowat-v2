import { expect, type Page } from '@playwright/test';
import { ORG_SLUG } from 'e2e/utils/constants';

export class LogoutPage {
  constructor(private readonly page: Page) {}

  get signOutButton() {
    return this.page.getByRole('button', { name: 'Sign out' }).first();
  }

  get confirmSignOutButton() {
    return this.page
      .getByRole('dialog', { name: 'Sign out?' })
      .getByRole('button', { name: 'Sign out' });
  }

  async logout() {
    await this.signOutButton.click();
    await this.confirmSignOutButton.click();
  }

  async expectLoginPage() {
    await this.page.waitForURL(/\/login/);
    await expect(this.page.getByTestId('layout-app')).not.toBeVisible();
  }

  async expectSessionInvalid() {
    await this.page.goto(`/app/${ORG_SLUG}`);
    await this.page.waitForURL(/\/login/);
  }
}
