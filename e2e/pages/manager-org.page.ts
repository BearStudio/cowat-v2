import { expect, type Page } from '@playwright/test';

import { ORG_SLUG } from 'e2e/utils/constants';

export class ManagerOrgPage {
  constructor(private readonly page: Page) {}

  async gotoOrgDashboard() {
    await this.page.goto(`/manager/${ORG_SLUG}`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoAccount() {
    await this.page.goto(`/manager/${ORG_SLUG}/account`);
    await this.page.waitForLoadState('networkidle');
  }

  get orgSettingsCard() {
    return this.page.getByText('Organization Settings').first();
  }

  get nameInput() {
    return this.page.getByLabel('Name');
  }

  get saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  async expectOrgNameVisible(name: string) {
    await expect(this.page.getByText(name).first()).toBeVisible();
  }

  async expectMembersSectionVisible() {
    await expect(this.page.getByText('Members').first()).toBeVisible();
  }

  async expectPendingInvitationsSectionVisible() {
    await expect(
      this.page.getByText('Pending invitations').first()
    ).toBeVisible();
  }

  async expectMemberRowVisible(opts: { email: string }) {
    await expect(this.page.getByText(opts.email).first()).toBeVisible();
  }
}
