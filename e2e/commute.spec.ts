import dayjs from 'dayjs';
import { expect, test } from 'e2e/utils';
import { USER_FILE } from 'e2e/utils/constants';
import { randomString } from 'remeda';

/** Format a date for the DateInput (DD/MM/YYYY). */
function formatDate(date: Date): string {
  return dayjs(date).format('DD/MM/YYYY');
}

/** Return a date N days from today. */
function daysFromNow(n: number): Date {
  return dayjs().add(n, 'day').toDate();
}

test.describe('Commute creation', () => {
  test.use({ storageState: USER_FILE });

  test.beforeEach(async ({ commuteFormPage }) => {
    await commuteFormPage.goto();
  });

  test('Create a one-way commute from scratch', async ({
    page,
    commuteFormPage,
  }) => {
    const date = daysFromNow(14);
    const dateStr = formatDate(date);

    // Step 1 — Details
    await commuteFormPage.dateInput.fill(dateStr);
    await commuteFormPage.dateInput.blur();

    // Uncheck round trip for ONEWAY
    const roundTrip = commuteFormPage.roundTripCheckbox;
    if (await roundTrip.isChecked()) {
      await roundTrip.click();
    }

    await commuteFormPage.seatsInput.clear();
    await commuteFormPage.seatsInput.fill('2');

    await commuteFormPage.clickNext();

    // Step 2 — Outward stops (2 stops pre-populated)
    await commuteFormPage.selectLocation(0, 'Home');
    await commuteFormPage.fillOutwardTime(0, '08:00');
    await commuteFormPage.selectLocation(1, 'Office');
    await commuteFormPage.fillOutwardTime(1, '08:30');

    await commuteFormPage.clickNext();

    // Step 3 — Recap (no inward stops for ONEWAY)
    await expect(page.getByText('One way').first()).toBeVisible();
    await expect(page.getByText('2 seats').first()).toBeVisible();

    await commuteFormPage.clickCreate();

    // Save template drawer appears — skip it
    await commuteFormPage.skipSaveTemplate();

    // Expect redirect to commutes list
    await expect(commuteFormPage.commutesListHeading).toBeVisible({
      timeout: 10_000,
    });
    await commuteFormPage.expectCommuteInList();
  });

  test('Create a round-trip commute from scratch', async ({
    page,
    commuteFormPage,
  }) => {
    const date = daysFromNow(15);
    const dateStr = formatDate(date);

    // Step 1 — Details
    await commuteFormPage.dateInput.fill(dateStr);
    await commuteFormPage.dateInput.blur();

    // Ensure round trip is checked (ROUND type)
    const roundTrip = commuteFormPage.roundTripCheckbox;
    if (!(await roundTrip.isChecked())) {
      await roundTrip.click();
    }

    await commuteFormPage.seatsInput.clear();
    await commuteFormPage.seatsInput.fill('3');

    await commuteFormPage.clickNext();

    // Step 2 — Outward stops
    await commuteFormPage.selectLocation(0, 'Home');
    await commuteFormPage.fillOutwardTime(0, '08:00');
    await commuteFormPage.selectLocation(1, 'Office');
    await commuteFormPage.fillOutwardTime(1, '08:30');

    await commuteFormPage.clickNext();

    // Step 3 — Inward times (ROUND only; stops shown in reverse: Office→Home)
    await commuteFormPage.fillInwardTime(0, '18:30'); // Office (display index 0)
    await commuteFormPage.fillInwardTime(1, '19:00'); // Home (display index 1)

    await commuteFormPage.clickNext();

    // Step 4 — Recap
    await expect(page.getByText('Round trip').first()).toBeVisible();
    await expect(page.getByText('3 seats').first()).toBeVisible();

    await commuteFormPage.clickCreate();

    // Save template drawer appears — skip it
    await commuteFormPage.skipSaveTemplate();

    // Expect redirect to commutes list
    await expect(commuteFormPage.commutesListHeading).toBeVisible({
      timeout: 10_000,
    });
    await commuteFormPage.expectCommuteInList();
  });

  test('Create a round commute from template', async ({
    page,
    commuteFormPage,
    commuteTemplatesPage,
  }) => {
    // Pre-condition: create a valid ROUND template with proper time ordering
    const templateName = `Commute Template ${randomString(6)}`;

    await commuteTemplatesPage.goto();
    await commuteTemplatesPage.newTemplateButton.click();

    await commuteTemplatesPage.nameInput.fill(templateName);
    await commuteTemplatesPage.seatsInput.clear();
    await commuteTemplatesPage.seatsInput.fill('2');

    const roundTrip = commuteTemplatesPage.roundTripCheckbox;
    if (!(await roundTrip.isChecked())) {
      await roundTrip.click();
    }

    await commuteTemplatesPage.clickNext();

    await commuteTemplatesPage.selectLocation(0, 'Home');
    await commuteTemplatesPage.fillOutwardTime(0, '08:00');
    await commuteTemplatesPage.selectLocation(1, 'Office');
    await commuteTemplatesPage.fillOutwardTime(1, '08:30');

    await commuteTemplatesPage.clickNext();

    // Inward times (ROUND; stops in reverse: Office→Home)
    await commuteTemplatesPage.fillInwardTime(0, '18:30'); // Office
    await commuteTemplatesPage.fillInwardTime(1, '19:00'); // Home

    await commuteTemplatesPage.clickNext();
    await commuteTemplatesPage.clickCreate();

    await expect(commuteTemplatesPage.heading).toBeVisible({ timeout: 10_000 });

    // Navigate to commute creation and pick the template
    const date = daysFromNow(16);
    const dateStr = formatDate(date);

    await commuteFormPage.goto();

    // Step 1 — Details: open template drawer and select the template
    await commuteFormPage.selectTemplateFromDrawer(templateName);

    // Fields pre-populated from template; update the date
    await commuteFormPage.dateInput.fill(dateStr);
    await commuteFormPage.dateInput.blur();

    await commuteFormPage.clickNext();

    // Step 2 — Outward stops pre-populated from template (Home 08:00, Office 08:30)
    await commuteFormPage.clickNext();

    // Step 3 — Inward times pre-populated from template (Office 18:30, Home 19:00)
    await commuteFormPage.clickNext();

    // Step 4 — Recap
    await expect(page.getByText('Round trip').first()).toBeVisible();
    await expect(page.getByText('2 seats').first()).toBeVisible();

    await commuteFormPage.clickCreate();

    await expect(commuteFormPage.commutesListHeading).toBeVisible({
      timeout: 10_000,
    });
    await commuteFormPage.expectCommuteInList();
  });

  test('Create a one-way commute from template', async ({
    page,
    commuteFormPage,
    commuteTemplatesPage,
  }) => {
    const templateName = `Commute Template ${randomString(6)}`;

    await commuteTemplatesPage.goto();
    await commuteTemplatesPage.newTemplateButton.click();

    await commuteTemplatesPage.nameInput.fill(templateName);
    await commuteTemplatesPage.seatsInput.clear();
    await commuteTemplatesPage.seatsInput.fill('2');

    const roundTrip = commuteTemplatesPage.roundTripCheckbox;
    if (await roundTrip.isChecked()) {
      await roundTrip.click(); // select ONE-WAY
    }

    await commuteTemplatesPage.clickNext();

    await commuteTemplatesPage.selectLocation(0, 'Home');
    await commuteTemplatesPage.fillOutwardTime(0, '08:00');
    await commuteTemplatesPage.selectLocation(1, 'Office');
    await commuteTemplatesPage.fillOutwardTime(1, '08:30');

    await commuteTemplatesPage.clickNext();

    await commuteTemplatesPage.clickCreate();

    await expect(commuteTemplatesPage.heading).toBeVisible({ timeout: 10_000 });

    const date = daysFromNow(17);
    const dateStr = formatDate(date);

    await commuteFormPage.goto();

    await commuteFormPage.selectTemplateFromDrawer(templateName);

    await commuteFormPage.dateInput.fill(dateStr);
    await commuteFormPage.dateInput.blur();

    await commuteFormPage.clickNext();
    await commuteFormPage.clickNext();

    await expect(page.getByText('One way').first()).toBeVisible();
    await expect(page.getByText('2 seats').first()).toBeVisible();

    await commuteFormPage.clickCreate();

    await expect(commuteFormPage.commutesListHeading).toBeVisible({
      timeout: 10_000,
    });
    await commuteFormPage.expectCommuteInList();
  });

  test('Edit a commute', async ({ page, commuteFormPage }) => {
    const date = daysFromNow(18);
    const dateStr = formatDate(date);

    await commuteFormPage.dateInput.fill(dateStr);
    await commuteFormPage.dateInput.blur();

    const roundTrip = commuteFormPage.roundTripCheckbox;
    if (await roundTrip.isChecked()) {
      await roundTrip.click(); // one-way for simplicity
    }

    await commuteFormPage.seatsInput.clear();
    await commuteFormPage.seatsInput.fill('2');

    await commuteFormPage.clickNext();

    await commuteFormPage.selectLocation(0, 'Home');
    await commuteFormPage.fillOutwardTime(0, '08:00');
    await commuteFormPage.selectLocation(1, 'Office');
    await commuteFormPage.fillOutwardTime(1, '08:30');

    await commuteFormPage.clickNext();

    await commuteFormPage.clickCreate();
    await commuteFormPage.skipSaveTemplate();

    await expect(commuteFormPage.commutesListHeading).toBeVisible({
      timeout: 10_000,
    });

    await commuteFormPage.expectCommuteInList();

    const commuteItem = page.getByText('DRIVER').first();
    await commuteItem.click();

    await page.getByRole('link', { name: 'Edit' }).click();

    // Step 1 — change seats
    await commuteFormPage.seatsInput.clear();
    await commuteFormPage.seatsInput.fill('4');

    await commuteFormPage.clickNext();

    // Step 2 — outward (no change, just continue)
    await commuteFormPage.clickNext();

    // Step 3 — recap
    await expect(page.getByText('4 seats').first()).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(commuteFormPage.commutesListHeading).toBeVisible({
      timeout: 10_000,
    });

    await expect(page.getByText('4 seats').first()).toBeVisible();
  });

  test('Cancel a commute', async ({ page, commuteFormPage }) => {
    const date = daysFromNow(19);
    const dateStr = formatDate(date);

    await commuteFormPage.dateInput.fill(dateStr);
    await commuteFormPage.dateInput.blur();

    const roundTrip = commuteFormPage.roundTripCheckbox;
    if (await roundTrip.isChecked()) {
      await roundTrip.click(); // one-way for simplicity
    }

    await commuteFormPage.seatsInput.clear();
    await commuteFormPage.seatsInput.fill('2');

    await commuteFormPage.clickNext();

    await commuteFormPage.selectLocation(0, 'Home');
    await commuteFormPage.fillOutwardTime(0, '08:00');
    await commuteFormPage.selectLocation(1, 'Office');
    await commuteFormPage.fillOutwardTime(1, '08:30');

    await commuteFormPage.clickNext();

    await commuteFormPage.clickCreate();
    await commuteFormPage.skipSaveTemplate();

    await expect(commuteFormPage.commutesListHeading).toBeVisible({
      timeout: 10_000,
    });

    await commuteFormPage.expectCommuteInList();

    const commuteItem = page.getByText('DRIVER').first();
    await commuteItem.click();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(commuteFormPage.commutesListHeading).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(dateStr)).toHaveCount(0);
  });
});
