import { expect, test } from 'e2e/utils';
import { USER_FILE } from 'e2e/utils/constants';
import { randomString } from 'remeda';

test.describe('Commute template management', () => {
  test.use({ storageState: USER_FILE });

  test.beforeEach(async ({ commuteTemplatesPage }) => {
    await commuteTemplatesPage.goto();
    await expect(commuteTemplatesPage.heading).toBeVisible();
  });

  test('Create a new commute template', async ({
    page,
    commuteTemplatesPage,
  }) => {
    const name = `Home to Office ${randomString(6)}`;

    await commuteTemplatesPage.newTemplateButton.click();
    await expect(page.getByText('New Template').first()).toBeVisible();

    // Step 1 — Details
    await commuteTemplatesPage.nameInput.fill(name);
    await commuteTemplatesPage.seatsInput.clear();
    await commuteTemplatesPage.seatsInput.fill('2');

    // Ensure round trip is checked (ROUND type)
    const roundTrip = commuteTemplatesPage.roundTripCheckbox;
    if (!(await roundTrip.isChecked())) {
      await roundTrip.click();
    }

    await commuteTemplatesPage.clickNext();

    // Step 2 — Outward stops (2 stops pre-populated)
    await commuteTemplatesPage.selectLocation(0, 'Home');
    await commuteTemplatesPage.fillOutwardTime(0, '08:00');
    await commuteTemplatesPage.selectLocation(1, 'Office');
    await commuteTemplatesPage.fillOutwardTime(1, '08:30');

    await commuteTemplatesPage.clickNext();

    // Step 3 — Inward stops (shown for ROUND; stops are displayed reversed: Office→Home)
    // Validation requires stop[0].inwardTime > stop[1].inwardTime (Home > Office)
    await commuteTemplatesPage.fillInwardTime(0, '18:00'); // Office (display index 0)
    await commuteTemplatesPage.fillInwardTime(1, '18:30'); // Home (display index 1)

    await commuteTemplatesPage.clickNext();

    // Step 4 — Summary → submit; onSuccess navigates back to the list (no toast)
    await commuteTemplatesPage.clickCreate();

    await expect(commuteTemplatesPage.heading).toBeVisible({ timeout: 10_000 });
    await commuteTemplatesPage.expectTemplateVisible(name);
  });

  test('Edit a commute template', async ({ page, commuteTemplatesPage }) => {
    // This test creates a template then edits it — double the form interactions.
    test.setTimeout(60_000);
    const originalName = `Edit Me ${randomString(6)}`;
    const updatedName = `${originalName} - Updated`;

    // Create a template with valid stop times to edit
    await commuteTemplatesPage.newTemplateButton.click();

    await commuteTemplatesPage.nameInput.fill(originalName);
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

    await commuteTemplatesPage.fillInwardTime(0, '18:00'); // Office (display index 0)
    await commuteTemplatesPage.fillInwardTime(1, '18:30'); // Home (display index 1)

    await commuteTemplatesPage.clickNext();

    await commuteTemplatesPage.clickCreate();

    // Wait for navigation back to the list before editing
    await expect(commuteTemplatesPage.heading).toBeVisible({ timeout: 10_000 });
    await commuteTemplatesPage.expectTemplateVisible(originalName);

    // Now edit the created template
    await commuteTemplatesPage.clickTemplateCard(originalName);
    // Wait for the template query to populate the form before editing,
    // otherwise the `values` prop overwrites user input when it resolves.
    await expect(commuteTemplatesPage.nameInput).toHaveValue(originalName, {
      timeout: 10_000,
    });

    // Step 1 — Details: update name and seats
    await commuteTemplatesPage.nameInput.clear();
    await commuteTemplatesPage.nameInput.fill(updatedName);
    await commuteTemplatesPage.seatsInput.clear();
    await commuteTemplatesPage.seatsInput.fill('4');

    await commuteTemplatesPage.clickNext();

    // Step 2 — Outward stops: valid times already in place, skip through
    await commuteTemplatesPage.clickNext();

    // Step 3 — Inward stops: valid times already in place, skip through
    await commuteTemplatesPage.clickNext();

    // Step 4 — Summary → save; onSuccess navigates back to the list (no toast)
    await commuteTemplatesPage.clickSave();

    await expect(commuteTemplatesPage.heading).toBeVisible({ timeout: 10_000 });
    await commuteTemplatesPage.expectTemplateVisible(updatedName);
  });

  test('Delete a commute template', async ({
    page,
    commuteTemplatesPage,
    confirmDialog,
  }) => {
    const name = `To Delete ${randomString(6)}`;

    // Create a ONEWAY template to delete (no inward stops step)
    await commuteTemplatesPage.newTemplateButton.click();

    await commuteTemplatesPage.nameInput.fill(name);
    await commuteTemplatesPage.seatsInput.clear();
    await commuteTemplatesPage.seatsInput.fill('1');

    // Uncheck round trip for ONEWAY
    const roundTrip = commuteTemplatesPage.roundTripCheckbox;
    if (await roundTrip.isChecked()) {
      await roundTrip.click();
    }

    await commuteTemplatesPage.clickNext();

    await commuteTemplatesPage.selectLocation(0, 'Home');
    await commuteTemplatesPage.fillOutwardTime(0, '07:00');
    await commuteTemplatesPage.selectLocation(1, 'Office');
    await commuteTemplatesPage.fillOutwardTime(1, '07:30');

    await commuteTemplatesPage.clickNext();

    // ONEWAY has no inward stops step — next lands on Summary
    await commuteTemplatesPage.clickCreate();

    // Wait for navigation back to the list (no toast on create)
    await expect(commuteTemplatesPage.heading).toBeVisible({ timeout: 10_000 });
    await commuteTemplatesPage.expectTemplateVisible(name);

    // Delete it
    await commuteTemplatesPage.clickDeleteOnRow(name);
    await expect(
      page.getByText('You are about to delete this template.').first()
    ).toBeVisible();
    await confirmDialog.confirm();

    await expect(page.getByText('Template deleted').first()).toBeVisible({
      timeout: 10_000,
    });
    await commuteTemplatesPage.expectTemplateNotVisible(name);
  });
});
