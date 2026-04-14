import { type Browser } from '@playwright/test';
import { expect, test } from 'e2e/utils';
import { ADMIN_FILE, INVITED_EMAIL, INVITED_FILE } from 'e2e/utils/constants';

import { OWNER_FILE } from './utils/constants';

type Invitation = { id: string; email: string; status: string };
type Member = { user: { email: string } };

/**
 * Sets up a fresh pending invitation for INVITED_EMAIL in the default org.
 *
 * - Cancels any existing pending invitation for that email.
 * - Removes the user from the org if they are already a member.
 * - Creates a new invitation and returns its ID.
 */
async function ensureInvitation(browser: Browser): Promise<string> {
  const adminContext = await browser.newContext({ storageState: ADMIN_FILE });

  try {
    // 1. Get current org state
    const orgResp = await adminContext.request.get(
      '/api/rest/organizations/active'
    );
    const org = await orgResp.json();

    // 2. Cancel any existing invitation for INVITED_EMAIL
    const existingInvitation = (
      org.invitations as Invitation[] | undefined
    )?.find((i) => i.email === INVITED_EMAIL);
    if (existingInvitation) {
      await adminContext.request.post(
        '/api/rest/organizations/cancel-invitation',
        { data: { invitationId: existingInvitation.id } }
      );
    }

    // 3. Remove INVITED_EMAIL from org members if present
    const existingMember = (org.members as Member[] | undefined)?.find(
      (m) => m.user.email === INVITED_EMAIL
    );
    if (existingMember) {
      await adminContext.request.post('/api/rest/organizations/remove-member', {
        data: { memberIdOrEmail: INVITED_EMAIL },
      });
    }

    // 4. Create a new invitation
    await adminContext.request.post('/api/rest/organizations/invite-bulk', {
      data: { emails: [INVITED_EMAIL], role: 'member' },
    });

    // 5. Get the new invitation ID
    const orgResp2 = await adminContext.request.get(
      '/api/rest/organizations/active'
    );
    const org2 = await orgResp2.json();
    const invitation = (org2.invitations as Invitation[] | undefined)?.find(
      (i) => i.email === INVITED_EMAIL
    );

    if (!invitation?.id) {
      throw new Error(
        `Failed to find invitation for ${INVITED_EMAIL} after creation`
      );
    }

    return invitation.id;
  } finally {
    await adminContext.close();
  }
}

test.describe('Invitation flow', () => {
  // The invited user is already authenticated via INVITED_FILE storage state.
  // Visiting /invitations/<id> while authenticated triggers the auto-accept
  // directly, avoiding the redirect-after-login flow.
  test.use({ storageState: INVITED_FILE });

  test('Accept an organization invitation', async ({
    browser,
    page,
    invitationPage,
  }) => {
    const invitationId = await ensureInvitation(browser);

    await page.goto(`/invitations/${invitationId}`);

    // The page auto-accepts once the session is available
    await invitationPage.expectAccepted();

    // Navigate to the app — the "Go to app" button calls navigate({ to: '/app' }).
    // Depending on parallel test interference the user may need onboarding or may
    // land on a "no organization" page, so we handle several outcomes.
    await invitationPage.goToApp();

    // Wait for the page to settle after the client-side navigation.
    await page.waitForLoadState('load');

    // Happy path: user is onboarded and has an org → OrgRedirect fires → layout-app.
    // Onboarding path: user was re-created without onboardedAt → "Welcome" heading.
    const layoutApp = page.getByTestId('layout-app');
    const onboardingHeading = page.getByRole('heading', { name: 'Welcome' });

    await expect(layoutApp.or(onboardingHeading)).toBeVisible({
      timeout: 15_000,
    });

    if (await onboardingHeading.isVisible().catch(() => false)) {
      await page.getByRole('textbox').first().fill('Invited User');
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(layoutApp).toBeVisible({ timeout: 15_000 });
    }
  });

  test.describe('Invitation flow as owner', () => {
    test.use({ storageState: OWNER_FILE });

    test('Cancel an organization invitation', async ({
      browser,
      page,
      managerOrgPage,
    }) => {
      await ensureInvitation(browser);
      await managerOrgPage.gotoOrgDashboard();

      await managerOrgPage.expectPendingInvitationsSectionVisible();
      await expect(page.getByText(INVITED_EMAIL).first()).toBeVisible({
        timeout: 15_000,
      });

      await managerOrgPage.clickCancelInvitation(INVITED_EMAIL);
      await managerOrgPage.confirmCancelInvitation();

      await managerOrgPage.expectInvitationNotVisible(INVITED_EMAIL);
    });

    test('Expiration organization invitation', async ({ browser, page }) => {
      const invitationId = await ensureInvitation(browser);
      const adminContext = await browser.newContext({
        storageState: ADMIN_FILE,
      });

      await adminContext.request.post('/api/test/expire-invitation', {
        data: { invitationId },
      });
      await adminContext.close();

      await page.goto(`/invitations/${invitationId}`);
      await expect(
        page.getByText('This invitation has expired or is no longer valid.')
      ).toBeVisible();
    });
  });
});
