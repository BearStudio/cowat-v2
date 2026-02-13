import { type Locator, type Page } from '@playwright/test';

export class LocationFormPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly addressInput: Locator;
  readonly createButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Name');
    this.addressInput = page.getByLabel('Address');
    this.createButton = page.getByText('Create');
    this.saveButton = page.getByText('Save');
  }

  async fillForm({ name, address }: { name: string; address?: string }) {
    await this.nameInput.fill(name);
    if (address) {
      await this.addressInput.fill(address);
    }
  }

  async create() {
    await this.createButton.click();
  }

  async save() {
    await this.saveButton.click();
  }
}
