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
    const content = card.locator('[data-slot="card-commute-content"]');
    await expect(content).toBeVisible();
    // Wait for the collapsible open animation to finish so that child
    // buttons are no longer intercepted by overlapping elements.
    await expect(content).not.toHaveAttribute('data-starting-style', /.*/);
  }

  cardContent(card: Locator) {
    return card.locator('[data-slot="card-commute-content"]');
  }

  bookButtons(card: Locator) {
    return card
      .locator('[data-slot="card-commute-trigger"]')
      .getByRole('button', { name: 'Book' });
  }

  cancelButton(card: Locator) {
    return card
      .locator('[data-slot="card-commute-trigger"]')
      .getByRole('button', { name: 'Cancel' });
  }
}
