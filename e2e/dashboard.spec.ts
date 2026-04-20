import { expect, test } from 'e2e/utils';
import { USER_FILE } from 'e2e/utils/constants';

test.describe('Dashboard — Commute Discovery', () => {
  test.use({ storageState: USER_FILE });

  test('View the 7-day commute calendar', async ({ page, dashboard }) => {
    await page.to('/app');

    await expect(page.locator('[data-testid="layout-app"]')).toBeVisible();

    const firstCard = dashboard.commuteCard();
    await expect(firstCard).toBeVisible();

    // At least one day section heading (date label) should be visible
    await expect(
      page.locator('[data-slot="card-commute"]').first()
    ).toBeVisible();
  });

  test('Expand and collapse a commute card', async ({ page, dashboard }) => {
    await page.to('/app');

    const firstCard = dashboard.commuteCard();
    await expect(firstCard).toBeVisible();

    // Expand the card
    await dashboard.expandCard(firstCard);
    await expect(dashboard.cardContent(firstCard)).toBeVisible();

    // Collapse the card
    await dashboard.collapseCard(firstCard);
  });
});
