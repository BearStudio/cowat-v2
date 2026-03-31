import dayjs from 'dayjs';
import { expect, test } from 'e2e/utils';
import { ADMIN_FILE, ORG_SLUG, USER_FILE } from 'e2e/utils/constants';

test.describe('[REGRESSION] Driver cannot open booking drawer for their own commute', () => {
  test.use({ storageState: ADMIN_FILE });

  test('booking drawer does not open via URL params for driver own commute', async ({
    page,
    commuteFormPage,
  }) => {
    // Create a commute as admin (driver) so we have one with known stop IDs
    const createResponsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/rpc/commute/create') && r.status() === 200
    );

    await commuteFormPage.goto();

    // Use a date within the dashboard's 7-day range so getByDate returns it
    const futureDate = dayjs().add(3, 'day').format('DD/MM/YYYY');
    await commuteFormPage.dateInput.fill(futureDate);
    await commuteFormPage.dateInput.blur();

    const roundTrip = commuteFormPage.roundTripCheckbox;
    if (await roundTrip.isChecked()) {
      await roundTrip.click();
    }

    await commuteFormPage.seatsInput.clear();
    await commuteFormPage.seatsInput.fill('2');
    await commuteFormPage.clickNext();

    // Outward stops
    await commuteFormPage.selectLocation(0, 'Home');
    await commuteFormPage.fillOutwardTime(0, '08:00');
    await commuteFormPage.selectLocation(1, 'Office');
    await commuteFormPage.fillOutwardTime(1, '08:30');
    await commuteFormPage.clickNext();

    // Recap & create
    await commuteFormPage.clickCreate();

    // Extract stop ID from the creation response
    const createResponse = await createResponsePromise;
    const createBody = await createResponse.json();
    const createdCommute: { id: string; stops: Array<{ id: string }> } =
      createBody?.json ?? createBody;

    const stopId = createdCommute.stops[0]?.id;
    const commuteId = createdCommute.id;
    expect(stopId).toBeTruthy();

    // Save template drawer appears — skip it
    await commuteFormPage.skipSaveTemplate();

    // Navigate to the dashboard with URL params that would open the booking drawer
    await page.goto(
      `/app/${ORG_SLUG}/?bookingStop=${stopId}&openCommutes=${commuteId}`
    );

    // Wait for the dashboard to fully load (commute cards render after data fetch)
    await expect(
      page.locator('[data-slot="card-commute"]').first()
    ).toBeVisible({ timeout: 10_000 });

    // The booking drawer must NOT open for the driver's own commute
    await expect(
      page.getByRole('dialog', { name: 'Book a ride' })
    ).not.toBeVisible();

    // The bookingStop search param should be cleared from the URL
    await expect(page).not.toHaveURL(/bookingStop=/);
  });
});

test.describe.serial('Booking flow', () => {
  test.use({ storageState: USER_FILE });

  test('book a ride on a commute stop', async ({
    page,
    dashboard,
    bookingDrawer,
    confirmDialog,
  }) => {
    await page.to('/app');

    const adminCard = dashboard.commuteCard({ hasText: 'Admin' });
    await dashboard.expandCard(adminCard);

    // Cancel any existing booking so we have a clean "Book" button
    const existingCancel = dashboard.cancelButton(adminCard);
    if ((await existingCancel.count()) > 0) {
      await existingCancel.click();
      await confirmDialog.confirm();
      await expect(dashboard.bookButtons(adminCard).first()).toBeVisible();
    }

    // Click the first "Book" button
    await dashboard.bookButtons(adminCard).first().click();

    // Expect booking drawer to open
    await bookingDrawer.expectOpen();

    // Expect comment textarea; trip type selector only rendered when multiple
    // options exist (ROUND commute on a non-terminal stop)
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('textbox')).toBeVisible();
    if ((await dialog.getByRole('radio').count()) > 0) {
      await expect(dialog.getByRole('radio').first()).toBeVisible();
    }

    // Submit the booking
    await bookingDrawer.submit();

    // Expect success toast and cancel button
    await expect(page.getByText('Booking request sent').first()).toBeVisible();
    await expect(dashboard.cancelButton(adminCard)).toBeVisible();

    // Expect no error toast
    await expect(
      page.getByText('Failed to send booking request')
    ).not.toBeVisible();
  });

  test('cancel an existing booking', async ({
    page,
    dashboard,
    bookingDrawer,
    confirmDialog,
  }) => {
    await page.to('/app');

    const adminCard = dashboard.commuteCard({ hasText: 'Admin' });
    await dashboard.expandCard(adminCard);

    // Ensure there is a booking to cancel — create one if not already present
    if ((await dashboard.cancelButton(adminCard).count()) === 0) {
      await dashboard.bookButtons(adminCard).first().click();
      await bookingDrawer.expectOpen();
      await bookingDrawer.submit();
      await expect(
        page.getByText('Booking request sent').first()
      ).toBeVisible();
    }

    // Click "Cancel" button and confirm the dialog
    await dashboard.cancelButton(adminCard).click();
    await confirmDialog.confirm();

    // Expect success toast and "Book" button restored
    await expect(page.getByText('Booking cancelled').first()).toBeVisible();
    await expect(dashboard.bookButtons(adminCard).first()).toBeVisible();

    // Expect no error toast
    await expect(page.getByText('Failed to cancel booking')).not.toBeVisible();
  });

  test('book, cancel, then book a different stop without conflict', async ({
    page,
    dashboard,
    bookingDrawer,
    confirmDialog,
  }) => {
    await page.to('/app');

    const adminCard = dashboard.commuteCard({ hasText: 'Admin' });
    await dashboard.expandCard(adminCard);

    // Cancel any existing booking from seed data before starting
    const existingCancel = dashboard.cancelButton(adminCard);
    if ((await existingCancel.count()) > 0) {
      await existingCancel.click();
      await confirmDialog.confirm();
      await expect(page.getByText('Booking cancelled').first()).toBeVisible();
    }

    // Step 1: Book the first available stop
    await expect(dashboard.bookButtons(adminCard).first()).toBeVisible();
    await dashboard.bookButtons(adminCard).first().click();
    await bookingDrawer.expectOpen();
    await bookingDrawer.submit();
    await expect(page.getByText('Booking request sent').first()).toBeVisible();

    // Step 2: Cancel the booking we just made
    await expect(dashboard.cancelButton(adminCard)).toBeVisible();
    await dashboard.cancelButton(adminCard).click();
    await confirmDialog.confirm();
    await expect(page.getByText('Booking cancelled').first()).toBeVisible();

    // Step 3: Book a different stop (second one)
    await expect(dashboard.bookButtons(adminCard).first()).toBeVisible();
    await dashboard.bookButtons(adminCard).nth(1).click();
    await bookingDrawer.expectOpen();
    await bookingDrawer.submit();
    await expect(page.getByText('Booking request sent').first()).toBeVisible();

    // Verify no error toasts appeared during the flow
    await expect(
      page.getByText('Failed to send booking request')
    ).not.toBeVisible();
    await expect(page.getByText('Failed to cancel booking')).not.toBeVisible();
  });
});
