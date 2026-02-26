import { expect, test } from 'e2e/utils';
import { USER_FILE } from 'e2e/utils/constants';

test.describe('Booking flow', () => {
  test.use({ storageState: USER_FILE });

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
