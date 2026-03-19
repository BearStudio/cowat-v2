import { type Locator, type Page } from '@playwright/test';
import { ORG_SLUG } from 'e2e/utils/constants';

export class RequestsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(`/app/${ORG_SLUG}/requests`);
  }

  firstRequestCard(): Locator {
    return this.page.locator('[data-slot="card"]').first();
  }

  acceptButton(card: Locator): Locator {
    return card.getByRole('button', { name: 'Accept' });
  }

  refuseButton(card: Locator): Locator {
    return card.getByRole('button', { name: 'Refuse' });
  }
}
