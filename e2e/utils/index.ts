import { test as base } from '@playwright/test';
import {
  BookingDrawer,
  ConfirmDialog,
  DashboardPage,
  LoginPage,
  ManagerUsersPage,
} from 'e2e/pages';
import { ExtendedPage, pageWithUtils } from 'e2e/utils/page';

type PageFixtures = {
  loginPage: LoginPage;
  dashboard: DashboardPage;
  bookingDrawer: BookingDrawer;
  confirmDialog: ConfirmDialog;
  usersPage: ManagerUsersPage;
};

const testWithPage = base.extend<ExtendedPage>({
  page: pageWithUtils,
});

const test = testWithPage.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboard: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  bookingDrawer: async ({ page }, use) => {
    await use(new BookingDrawer(page));
  },
  confirmDialog: async ({ page }, use) => {
    await use(new ConfirmDialog(page));
  },
  usersPage: async ({ page }, use) => {
    await use(new ManagerUsersPage(page));
  },
});

export * from '@playwright/test';
export { test };
