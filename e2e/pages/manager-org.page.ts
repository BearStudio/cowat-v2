import { expect, type Page } from '@playwright/test';
import { ORG_SLUG } from 'e2e/utils/constants';

export class ManagerOrgPage {
  constructor(private readonly page: Page) {}

  async gotoOrgDashboard() {
    await this.page.goto(`/manager/${ORG_SLUG}`);
    // networkidle may fire before the org query resolves; wait for the layout
    // shell first so that expectOrgNameVisible has a full 15s for the data.
    await this.page.getByTestId('layout-manager').waitFor({ timeout: 15_000 });
  }

  async gotoAccount() {
    await this.page.goto(`/manager/${ORG_SLUG}/account`);
    // Wait for the org settings form to be ready (not just networkidle) so that
    // nameInput.fill() operates on the rendered input, not a skeleton.
    await this.page.getByLabel('Name').waitFor({ timeout: 15_000 });
  }

  async gotoOrganizationsList() {
    await this.page.goto('/manager/organizations');
    await this.page.getByTestId('layout-manager').waitFor({ timeout: 15_000 });
  }

  async selectOwnerByEmail(email: string) {
    await this.page.getByRole('combobox').last().click();
    const option = this.page.getByRole('option', { name: new RegExp(email) });
    await option.waitFor({ timeout: 10_000 });
    await option.click();
  }

  async openDeleteOrgDrawer() {
    await this.page.getByRole('button', { name: 'Confirm' }).click();
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
    await expect(this.page.getByText(name).first()).toBeVisible({
      timeout: 15_000,
    });
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

  async clickCancelInvitation(email: string) {
    const row = this.page
      .locator('div')
      .filter({ hasText: email })
      .filter({ has: this.page.getByRole('button', { name: 'Cancel' }) });

    await row.getByRole('button', { name: 'Cancel' }).click();
  }

  async confirmCancelInvitation() {
    await this.page.getByRole('button', { name: 'Cancel invitation' }).click();
  }

  async expectInvitationVisible(email: string) {
    const invitationsSection = this.page
      .locator('div')
      .filter({ hasText: 'Pending invitations' });

    await expect(invitationsSection.getByText(email)).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectInvitationNotVisible(email: string) {
    const invitationsSection = this.page
      .locator('div')
      .filter({ hasText: 'Pending invitations' });

    await expect(invitationsSection.getByText(email)).not.toBeVisible({
      timeout: 10_000,
    });
  }
}
