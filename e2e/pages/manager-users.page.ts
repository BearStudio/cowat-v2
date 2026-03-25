import { expect, type Page } from '@playwright/test';

export class ManagerUsersPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/manager/users');
  }

  get newUserButton() {
    return this.page.getByText('New User');
  }

  get searchInput() {
    return this.page.getByPlaceholder('Search...');
  }

  get nameInput() {
    return this.page.getByLabel('Name');
  }

  get emailInput() {
    return this.page.getByLabel('Email');
  }

  async clickCreate() {
    await this.page.getByText('Create').click();
  }

  async clickSave() {
    await this.page.getByText('Save').click();
  }

  async waitForUsersPage() {
    await this.page.waitForURL('**/manager/users');
  }

  async waitForNewUserPage() {
    await this.page.waitForURL('**/manager/users/new');
  }

  async clickUser(identifier: string, options?: { exact?: boolean }) {
    await this.page
      .getByText(identifier, { exact: options?.exact })
      .first()
      .click({ force: true });
  }

  async clickEditUser() {
    await this.page.getByRole('link', { name: 'Edit user' }).click();
  }

  async clickDelete() {
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }

  async expectUserVisible(email: string) {
    await expect(this.page.getByText(email)).toBeVisible();
  }

  async expectNoAccess() {
    await expect(this.page.getByText('Unauthorized')).toBeVisible();
  }

  async expectUserDeleted() {
    await expect(this.page.getByText('User deleted')).toBeVisible();
  }
}
