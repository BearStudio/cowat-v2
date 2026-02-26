import { expect, type Locator, type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  commuteCard(options?: { hasText?: string }) {
    const cards = this.page.locator('[data-slot="card-commute"]');
    return options?.hasText
      ? cards.filter({ hasText: options.hasText }).first()
      : cards.first();
  }

  async expandCard(card: Locator) {
    await card.locator('[data-slot="card-commute-trigger"]').click();
    await expect(
      card.locator('[data-slot="card-commute-content"]')
    ).toBeVisible();
  }

  cardContent(card: Locator) {
    return card.locator('[data-slot="card-commute-content"]');
  }

  bookButtons(card: Locator) {
    return this.cardContent(card).getByRole('button', { name: 'Book' });
  }

  cancelButton(card: Locator) {
    return this.cardContent(card).getByRole('button', { name: 'Cancel' });
  }
}
