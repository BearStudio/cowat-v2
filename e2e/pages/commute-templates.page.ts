import { expect, type Page } from '@playwright/test';
import { ORG_SLUG } from 'e2e/utils/constants';

export class CommuteTemplatesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(`/app/${ORG_SLUG}/account/commute-templates`);
    // Wait for auth + org guard to resolve before asserting page content
    await this.page.getByTestId('layout-app').waitFor({ timeout: 15_000 });
  }

  get heading() {
    return this.page.getByText('Commute Templates').first();
  }

  get newTemplateButton() {
    return this.page.getByRole('link', { name: 'New Template' });
  }

  templateCard(name: string) {
    // Use data-slot="card" to scope to the card-level element only (not ancestor wrappers)
    return this.page
      .locator('[data-slot="card"]')
      .filter({ has: this.page.getByText(name, { exact: true }) })
      .first();
  }

  async clickDeleteOnRow(templateName: string) {
    await this.templateCard(templateName)
      .getByRole('button', { name: 'Delete', exact: true })
      .click();
  }

  async clickTemplateCard(templateName: string) {
    await this.templateCard(templateName)
      .getByText(templateName, { exact: true })
      .click();
  }

  // Multi-step form helpers

  get nameInput() {
    return this.page.getByLabel('Name');
  }

  get seatsInput() {
    return this.page.getByLabel('Seats');
  }

  get roundTripCheckbox() {
    return this.page.getByRole('checkbox', { name: 'Round trip' });
  }

  async selectLocation(stopIndex: number, locationName: string) {
    const comboboxes = this.page.getByRole('combobox', { name: 'Location' });
    await comboboxes.nth(stopIndex).click();
    await this.page
      .getByRole('option', { name: locationName, exact: true })
      .click();
  }

  async fillOutwardTime(stopIndex: number, time: string) {
    const timeInputs = this.page.getByLabel('Outbound time');
    await timeInputs.nth(stopIndex).fill(time);
  }

  async fillInwardTime(stopIndex: number, time: string) {
    const timeInputs = this.page.getByLabel('Inbound time');
    await timeInputs.nth(stopIndex).fill(time);
  }

  async clickNext() {
    await this.page.getByRole('button', { name: 'Next' }).click();
  }

  async clickCreate() {
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async clickSave() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async expectTemplateVisible(name: string) {
    const item = this.page.getByText(name).first();
    const loadMore = this.page.getByRole('button', { name: 'Load more' });
    await expect(async () => {
      if (await item.isVisible()) return;
      if ((await loadMore.isVisible()) && !(await loadMore.isDisabled())) {
        await loadMore.click();
      }
      await expect(item).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });
  }

  async expectTemplateNotVisible(name: string) {
    await expect(this.page.getByText(name)).not.toBeVisible();
  }
}
