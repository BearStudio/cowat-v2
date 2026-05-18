import { type Browser } from '@playwright/test';
import { BookingDrawer, ConfirmDialog, DashboardPage } from 'e2e/pages';
import { expect, test } from 'e2e/utils';
import { ADMIN_FILE, ORG_SLUG, USER_FILE } from 'e2e/utils/constants';

/**
 * Creates a REQUESTED booking as USER on ADMIN's commute,
 * so the admin sees an incoming request on their requests page.
 */
async function ensureBookingRequest(browser: Browser) {
  const userContext = await browser.newContext({ storageState: USER_FILE });
  const userPage = await userContext.newPage();
  const dashboard = new DashboardPage(userPage);
  const bookingDrawer = new BookingDrawer(userPage);
  const confirmDialog = new ConfirmDialog(userPage);

  await userPage.goto(`/app/${ORG_SLUG}/`);

  const adminCard = dashboard.commuteCard({ hasText: 'Admin' });
  await dashboard.expandCard(adminCard);

  // Cancel any existing booking so we start clean
  if ((await dashboard.cancelButton(adminCard).count()) > 0) {
    await dashboard.cancelButton(adminCard).click();
    await confirmDialog.confirm();
    await expect(userPage.getByText('Booking cancelled').first()).toBeVisible();
  }

  // Submit a booking request (status = REQUESTED)
  await dashboard.bookButtons(adminCard).first().click();
  await bookingDrawer.expectOpen();
  await bookingDrawer.submit();
  await expect(
    userPage.getByText('Booking request sent').first()
  ).toBeVisible();

  await userContext.close();
}

test.describe.serial('Driver — Request Management', () => {
  test.use({ storageState: ADMIN_FILE });

  test('accept a booking request', async ({ browser, page, requestsPage }) => {
    await ensureBookingRequest(browser);
    await requestsPage.goto();

    const firstCard = requestsPage.firstRequestCard();
    await expect(firstCard).toBeVisible();
    await expect(requestsPage.acceptButton(firstCard)).toBeVisible();
    await expect(requestsPage.refuseButton(firstCard)).toBeVisible();

    await requestsPage.acceptButton(firstCard).click();

    await expect(page.getByText('Request accepted').first()).toBeVisible();
  });

  test('refuse a booking request', async ({ browser, page, requestsPage }) => {
    await ensureBookingRequest(browser);
    await requestsPage.goto();

    const firstCard = requestsPage.firstRequestCard();
    await expect(firstCard).toBeVisible();

    await requestsPage.refuseButton(firstCard).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Refuse' })
      .click();

    await expect(page.getByText('Request refused').first()).toBeVisible();
  });
});
