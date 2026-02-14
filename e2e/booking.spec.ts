import { expect, test } from 'e2e/utils';
import { USER_FILE } from 'e2e/utils/constants';

test.describe('Booking flow', () => {
  test.use({ storageState: USER_FILE });

  test('book, cancel, then book a different stop without conflict', async ({
    page,
  }) => {
    await page.to('/app');

    // Find an admin commute card and expand it
    const adminCard = page
      .locator('[data-slot="card-commute"]', { hasText: 'Admin' })
      .first();
    await adminCard.locator('[data-slot="card-commute-trigger"]').click();
    const content = adminCard.locator('[data-slot="card-commute-content"]');
    await expect(content).toBeVisible();

    // If there is an existing booking (from seed data), cancel it first
    const existingCancelBtn = content.getByRole('button', { name: 'Cancel' });
    if ((await existingCancelBtn.count()) > 0) {
      await existingCancelBtn.click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByText('Booking cancelled').first()).toBeVisible();
    }

    // Step 1: Book the first available stop
    const bookButtons = content.getByRole('button', { name: 'Book' });
    await expect(bookButtons.first()).toBeVisible();
    await bookButtons.first().click();

    // Submit the booking form in the drawer
    const drawer = page.getByRole('dialog');
    await expect(
      drawer.getByRole('heading', { name: 'Book a ride' })
    ).toBeVisible();
    await drawer.getByRole('button', { name: 'Book' }).click();
    await expect(page.getByText('Booking request sent').first()).toBeVisible();

    // Step 2: Cancel the booking we just made
    await expect(content.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await content.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Booking cancelled').first()).toBeVisible();

    // Step 3: Book a different stop (pick the second one)
    const newBookButtons = content.getByRole('button', { name: 'Book' });
    await expect(newBookButtons.first()).toBeVisible();
    await newBookButtons.nth(1).click();

    // Submit the booking form
    const drawer2 = page.getByRole('dialog');
    await expect(
      drawer2.getByRole('heading', { name: 'Book a ride' })
    ).toBeVisible();
    await drawer2.getByRole('button', { name: 'Book' }).click();
    await expect(page.getByText('Booking request sent').first()).toBeVisible();

    // Verify no error toasts appeared during the flow
    await expect(
      page.getByText('Failed to send booking request')
    ).not.toBeVisible();
    await expect(page.getByText('Failed to cancel booking')).not.toBeVisible();
  });
});
