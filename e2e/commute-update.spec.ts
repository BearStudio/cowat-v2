import dayjs from 'dayjs';
import {
  BookingDrawer,
  CommuteFormPage,
  DashboardPage,
  RequestsPage,
} from 'e2e/pages';
import { expect, test } from 'e2e/utils';
import { ADMIN_FILE, ORG_SLUG, USER_FILE } from 'e2e/utils/constants';

/** Format a date for the DateInput (DD/MM/YYYY). */
function formatDate(date: Date): string {
  return dayjs(date).format('DD/MM/YYYY');
}

/** Return a date N days from today. */
function daysFromNow(n: number): Date {
  return dayjs().add(n, 'day').toDate();
}

test.describe
  .serial('Commute update — excess bookings cancelled on seat reduction', () => {
  let commuteId: string;

  test('setup: create commute, book, accept, then reduce seats', async ({
    browser,
  }) => {
    test.setTimeout(90_000);

    // ── 1. Admin creates a commute with 3 seats ──────────────────────────
    const adminCtx = await browser.newContext({ storageState: ADMIN_FILE });
    const adminPage = await adminCtx.newPage();
    const commuteForm = new CommuteFormPage(adminPage);

    const createResponsePromise = adminPage.waitForResponse(
      (r) => r.url().includes('/api/rpc/commute/create') && r.status() === 200
    );

    await commuteForm.goto();
    await commuteForm.fromScratchButton.click();

    const date = daysFromNow(3);
    await commuteForm.dateInput.fill(formatDate(date));
    await commuteForm.dateInput.blur();

    const roundTrip = commuteForm.roundTripCheckbox;
    if (await roundTrip.isChecked()) {
      await roundTrip.click();
    }

    await commuteForm.seatsInput.clear();
    await commuteForm.seatsInput.fill('3');
    await commuteForm.clickNext();

    await commuteForm.selectLocation(0, 'Home');
    await commuteForm.fillOutwardTime(0, '08:00');
    await commuteForm.selectLocation(1, 'Office');
    await commuteForm.fillOutwardTime(1, '08:30');
    await commuteForm.clickNext();

    await commuteForm.clickCreate();

    const createResponse = await createResponsePromise;
    const createBody = await createResponse.json();
    const createdCommute: { id: string; stops: Array<{ id: string }> } =
      createBody?.json ?? createBody;
    commuteId = createdCommute.id;
    const stopId = createdCommute.stops[0]?.id;
    expect(commuteId).toBeTruthy();
    expect(stopId).toBeTruthy();

    await expect(commuteForm.commutesListHeading).toBeVisible({
      timeout: 10_000,
    });

    // ── 2. User books a ride on the admin's commute ──────────────────────
    const userCtx = await browser.newContext({ storageState: USER_FILE });
    const userPage = await userCtx.newPage();
    const bookingDrawer = new BookingDrawer(userPage);

    // Navigate directly to the specific commute via URL params
    await userPage.goto(
      `/app/${ORG_SLUG}/?bookingStop=${stopId}&openCommutes=${commuteId}`
    );
    await expect(
      userPage.locator('[data-slot="card-commute"]').first()
    ).toBeVisible({ timeout: 10_000 });

    await bookingDrawer.expectOpen();
    await bookingDrawer.submit();

    await expect(
      userPage.getByText('Booking request sent').first()
    ).toBeVisible();

    await userPage.close();
    await userCtx.close();

    // ── 3. Admin accepts the booking request ─────────────────────────────
    const requestsPage = new RequestsPage(adminPage);
    await requestsPage.goto();

    const card = requestsPage.firstRequestCard();
    await expect(card).toBeVisible({ timeout: 10_000 });
    await requestsPage.acceptButton(card).click();

    await expect(adminPage.getByText('accepted').first()).toBeVisible({
      timeout: 5_000,
    });

    // ── 4. Admin edits commute and reduces seats to 1 ────────────────────
    await commuteForm.gotoEdit(commuteId);

    // Wait for form to populate
    await expect(commuteForm.seatsInput).toHaveValue('3', {
      timeout: 10_000,
    });

    // Step 1 — Details: reduce seats
    await commuteForm.seatsInput.clear();
    await commuteForm.seatsInput.fill('1');
    await commuteForm.clickNext();

    // Step 2 — Outward stops: already valid, skip
    await commuteForm.clickNext();

    // Step 3 — Recap: expect warning about passengers
    await expect(
      adminPage.getByText(/passenger.*currently booked/i).first()
    ).toBeVisible({ timeout: 5_000 });

    const updateResponsePromise = adminPage.waitForResponse(
      (r) => r.url().includes('/api/rpc/commute/update') && r.status() === 200
    );

    await commuteForm.clickSave();

    await updateResponsePromise;
    await expect(commuteForm.commutesListHeading).toBeVisible({
      timeout: 10_000,
    });

    await adminPage.close();
    await adminCtx.close();
  });

  test('user booking is no longer active after seat reduction', async ({
    browser,
  }) => {
    const userCtx = await browser.newContext({ storageState: USER_FILE });
    const userPage = await userCtx.newPage();
    const dashboard = new DashboardPage(userPage);

    // Navigate with openCommutes to auto-expand the specific card
    await userPage.goto(`/app/${ORG_SLUG}/?openCommutes=${commuteId}`);
    await expect(
      userPage.locator('[data-slot="card-commute"]').first()
    ).toBeVisible({ timeout: 10_000 });

    // Target the exact commute card by data attribute
    const targetCard = userPage.locator(
      `[data-slot="card-commute"][data-commute-id="${commuteId}"]`
    );
    await expect(targetCard).toBeVisible({ timeout: 10_000 });

    // The user's booking should have been cancelled — "Book" button should
    // be visible instead of "Cancel"
    await expect(dashboard.bookButtons(targetCard).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(dashboard.cancelButton(targetCard)).not.toBeVisible();

    await userPage.close();
    await userCtx.close();
  });
});
