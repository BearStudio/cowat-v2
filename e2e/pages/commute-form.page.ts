import { expect, type Page } from '@playwright/test';
import { ORG_SLUG } from 'e2e/utils/constants';

export class CommuteFormPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(`/app/${ORG_SLUG}/commutes/new`);
    await this.page.getByTestId('layout-app').waitFor({ timeout: 15_000 });
  }

  // ─── Template drawer ──────────────────────────────────────────────────

  get useTemplateButton() {
    return this.page.getByRole('button', { name: 'Use a template' });
  }

  /** Open the template drawer and click a template card by its name. */
  async selectTemplateFromDrawer(templateName: string) {
    await this.useTemplateButton.click();
    await this.page
      .getByRole('dialog')
      .locator('[data-slot="card"]')
      .filter({ has: this.page.getByText(templateName) })
      .first()
      .click();
  }

  // ─── Multi-step form ──────────────────────────────────────────────────

  get dateInput() {
    return this.page.getByLabel('Date');
  }

  get roundTripCheckbox() {
    return this.page.getByRole('checkbox', { name: 'Round trip' });
  }

  get seatsInput() {
    return this.page.getByLabel('Seats');
  }

  async selectLocation(stopIndex: number, locationName: string) {
    const comboboxes = this.page.getByRole('combobox', { name: 'Location' });
    await comboboxes.nth(stopIndex).click();
    await this.page
      .getByRole('option', { name: locationName, exact: true })
      .click();
  }

  async fillOutwardTime(stopIndex: number, time: string) {
    await this.page.getByLabel('Outbound time').nth(stopIndex).fill(time);
  }

  async fillInwardTime(stopIndex: number, time: string) {
    await this.page.getByLabel('Inbound time').nth(stopIndex).fill(time);
  }

  async clickNext() {
    await this.page.getByRole('button', { name: 'Next' }).click();
  }

  async clickCreate() {
    await this.page.getByRole('button', { name: 'Create' }).last().click();
  }

  async clickSave() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  /** Dismiss the save-template drawer that appears after creating from scratch. */
  async skipSaveTemplate() {
    await this.page
      .getByRole('button', { name: 'Continue without creating a template' })
      .click({ timeout: 10_000 });
  }

  async gotoEdit(commuteId: string) {
    await this.page.goto(`/app/${ORG_SLUG}/commutes/${commuteId}/update`);
    await this.page.getByTestId('layout-app').waitFor({ timeout: 15_000 });
  }

  // ─── Commutes list assertions ─────────────────────────────────────────

  get commutesListHeading() {
    return this.page.getByText('Commutes').first();
  }

  async expectCommuteInList() {
    await expect(
      this.page.locator('[data-slot="card-commute"]').first()
    ).toBeVisible({ timeout: 10_000 });
  }
}
