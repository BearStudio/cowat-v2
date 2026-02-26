import { expect, type Page } from '@playwright/test';

export class InvitationPage {
  constructor(private readonly page: Page) {}

  async expectAccepted() {
    // Session load + acceptInvitation + setActive can take several seconds
    await expect(
      this.page.getByText('Invitation accepted').first()
    ).toBeVisible({ timeout: 20_000 });
  }

  async goToApp() {
    await this.page.getByRole('button', { name: 'Go to app' }).click();
  }
}
