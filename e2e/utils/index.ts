import { test as base } from '@playwright/test';
import {
  AccountPage,
  BookingDrawer,
  CommuteFormPage,
  CommuteTemplatesPage,
  ConfirmDialog,
  DashboardPage,
  InvitationPage,
  LocationsPage,
  LoginPage,
  ManagerOrgPage,
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
  managerOrgPage: ManagerOrgPage;
  usersPage: ManagerUsersPage;
  requestsPage: RequestsPage;
};

const testWithPage = base.extend<ExtendedPage>({
  page: pageWithUtils,
});

const test = testWithPage.extend<PageFixtures>({
  accountPage: async ({ page }, apply) => {
    await apply(new AccountPage(page));
  },
  loginPage: async ({ page }, apply) => {
    await apply(new LoginPage(page));
  },
  dashboard: async ({ page }, apply) => {
    await apply(new DashboardPage(page));
  },
  bookingDrawer: async ({ page }, apply) => {
    await apply(new BookingDrawer(page));
  },
  confirmDialog: async ({ page }, apply) => {
    await apply(new ConfirmDialog(page));
  },
  commuteFormPage: async ({ page }, apply) => {
    await apply(new CommuteFormPage(page));
  },
  commuteTemplatesPage: async ({ page }, apply) => {
    await apply(new CommuteTemplatesPage(page));
  },
  invitationPage: async ({ page }, apply) => {
    await apply(new InvitationPage(page));
  },
  locationsPage: async ({ page }, apply) => {
    await apply(new LocationsPage(page));
  },
  managerOrgPage: async ({ page }, apply) => {
    await apply(new ManagerOrgPage(page));
  },
  usersPage: async ({ page }, apply) => {
    await apply(new ManagerUsersPage(page));
  },
  requestsPage: async ({ page }, apply) => {
    await apply(new RequestsPage(page));
  },
});

export * from '@playwright/test';
export { test };
