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

  // ─── Create a commute from scratch ──────────────────────────────────────────────────

  async createFromScratch({
    date,
    seats,
    roundTrip = false,
  }: {
    date: string;
    seats: string;
    roundTrip?: boolean;
  }) {
    await this.goto();

    // Step 1 — Details
    await this.dateInput.fill(date);
    await this.dateInput.blur();

    const roundTripCheckbox = this.roundTripCheckbox;
    if (roundTrip) {
      if (!(await roundTripCheckbox.isChecked())) {
        await roundTripCheckbox.click();
      }
    } else {
      if (await roundTripCheckbox.isChecked()) {
        await roundTripCheckbox.click();
      }
    }

    await this.seatsInput.clear();
    await this.seatsInput.fill(seats);
    await this.clickNext();

    // Step 2 — Outward stops
    await this.selectLocation(0, 'Home');
    await this.fillOutwardTime(0, '08:00');
    await this.selectLocation(1, 'Office');
    await this.fillOutwardTime(1, '08:30');
    await this.clickNext();

    // Step 3 — Inward only for round-trip
    if (roundTrip) {
      await this.fillInwardTime(0, '18:30');
      await this.fillInwardTime(1, '19:00');
      await this.clickNext();
    }

    // Step 4 — Recap
    if (roundTrip) {
      await expect(this.page.getByText('Round trip')).toBeVisible();
    } else {
      await expect(this.page.getByText('One way')).toBeVisible();
    }

    await expect(this.page.getByText(`${seats} seats`).first()).toBeVisible();

    await this.clickCreate();
    await this.skipSaveTemplate();

    await expect(this.commutesListHeading).toBeVisible({ timeout: 10_000 });
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
