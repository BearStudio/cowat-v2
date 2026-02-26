import { expect, test } from 'e2e/utils';
import { USER_FILE } from 'e2e/utils/constants';

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

    // Expect trip type selector and optional comment textarea to be visible
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('radio').first()).toBeVisible();
    await expect(dialog.getByRole('textbox')).toBeVisible();

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

    // Click "Cancel" button
    await dashboard.cancelButton(adminCard).click();

    // Expect confirmation dialog with "Delete" button
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Confirm the cancellation
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
