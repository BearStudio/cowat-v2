import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async expectAppLayout() {
    await this.page.waitForURL('/app');
    await expect(this.page.getByTestId('layout-app')).toBeVisible();
  }
}
