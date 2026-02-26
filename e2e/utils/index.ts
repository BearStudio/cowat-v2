import { test as base } from '@playwright/test';
import {
  AccountPage,
  BookingDrawer,
  CommuteFormPage,
  CommuteTemplatesPage,
  ConfirmDialog,
  DashboardPage,
  InvitationPage,
  LoginPage,
  LocationsPage,
  ManagerUsersPage,
  RequestsPage,
} from 'e2e/pages';
import { ExtendedPage, pageWithUtils } from 'e2e/utils/page';

type PageFixtures = {
  accountPage: AccountPage;
  loginPage: LoginPage;
  dashboard: DashboardPage;
  bookingDrawer: BookingDrawer;
  confirmDialog: ConfirmDialog;
  commuteFormPage: CommuteFormPage;
  commuteTemplatesPage: CommuteTemplatesPage;
  invitationPage: InvitationPage;
  locationsPage: LocationsPage;
  usersPage: ManagerUsersPage;
  requestsPage: RequestsPage;
};

const testWithPage = base.extend<ExtendedPage>({
  page: pageWithUtils,
});

const test = testWithPage.extend<PageFixtures>({
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
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
  commuteFormPage: async ({ page }, use) => {
    await use(new CommuteFormPage(page));
  },
  commuteTemplatesPage: async ({ page }, use) => {
    await use(new CommuteTemplatesPage(page));
  },
  invitationPage: async ({ page }, use) => {
    await use(new InvitationPage(page));
  },
  locationsPage: async ({ page }, use) => {
    await use(new LocationsPage(page));
  },
  usersPage: async ({ page }, use) => {
    await use(new ManagerUsersPage(page));
  },
  requestsPage: async ({ page }, use) => {
    await use(new RequestsPage(page));
  },
});

export * from '@playwright/test';
export { test };
