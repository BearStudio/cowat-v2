import { expect, Locator, Page } from '@playwright/test';
import { CustomFixture } from 'e2e/utils/types';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import {
  AUTH_EMAIL_OTP_MOCKED,
  AUTH_SIGNUP_ENABLED,
} from '@/features/auth/config';
import locales from '@/locales';
import { FileRouteTypes } from '@/routeTree.gen';

const MAILDEV_BASE_URL =
  process.env.MAILDEV_BASE_URL ?? 'http://127.0.0.1:1080';

type MailDevEmail = {
  id: string;
  to?: Array<{ address?: string }>;
  envelope?: { to?: Array<{ address?: string }> };
  html?: string | null;
  text?: string | null;
};

interface PageUtils {
  /**
   * Utility used to authenticate a user on the app
   */
  login: (input: { email: string; code?: string }) => Promise<void>;

  /**
   * Override of the `page.goto` method with typed routes from the app
   */
  to: (
    url: FileRouteTypes['to'],
    options?: Parameters<Page['goto']>[1]
  ) => ReturnType<Page['goto']>;
}

export type ExtendedPage = { page: PageUtils };

export const pageWithUtils: CustomFixture<Page & PageUtils> = async (
  { page },
  apply
) => {
  page.login = async function login(input: { email: string; code?: string }) {
    const routeLogin = '/login' satisfies FileRouteTypes['to'];
    const routeLoginVerify = '/login/verify' satisfies FileRouteTypes['to'];
    const emailInput = page.getByPlaceholder(
      locales[DEFAULT_LANGUAGE_KEY].auth.common.email.label
    );
    const submitButton = page.getByRole('button', {
      name: locales[DEFAULT_LANGUAGE_KEY].auth[
        AUTH_SIGNUP_ENABLED ? 'pageLoginWithSignUp' : 'pageLogin'
      ].loginWithEmail,
    });

    await page.waitForURL(`**${routeLogin}**`);
    await expect(
      page.getByText(
        locales[DEFAULT_LANGUAGE_KEY].auth.pageLoginWithSignUp.title
      )
    ).toBeVisible({ timeout: 30_000 });

    await fillInputAfterHydration(emailInput, input.email);

    await Promise.all([
      submitButton.click(),
      page.waitForURL(`**${routeLoginVerify}**`),
    ]);

    const code =
      input.code ??
      (process.env.CI
        ? await getLoginOtpFromMailDev(input.email)
        : AUTH_EMAIL_OTP_MOCKED);

    await page
      .getByText(locales[DEFAULT_LANGUAGE_KEY].auth.common.otp.label)
      .fill(code);
  };

  page.to = page.goto;

  await apply(page);
};

async function getLoginOtpFromMailDev(email: string): Promise<string> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const listResponse = await fetch(`${MAILDEV_BASE_URL}/email`);
    if (listResponse.ok) {
      const emails = (
        (await listResponse.json()) as MailDevEmail[]
      ).toReversed();
      const targetEmail = emails.find((message) => {
        const recipients = [
          ...(message.to ?? []),
          ...(message.envelope?.to ?? []),
        ];
        return recipients.some((recipient) => recipient.address === email);
      });

      if (targetEmail) {
        const detailResponse = await fetch(
          `${MAILDEV_BASE_URL}/email/${targetEmail.id}`
        );
        if (detailResponse.ok) {
          const detail = (await detailResponse.json()) as MailDevEmail;
          const content = `${detail.text ?? ''}\n${detail.html ?? ''}`;
          const match = content.match(/\b(\d{6})\b/);
          if (match?.[1]) return match[1];
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for OTP email for ${email}`);
}

async function fillInputAfterHydration(
  input: Locator,
  value: string
): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt++) {
    await input.fill(value);

    try {
      await expect(input).toHaveValue(value, { timeout: 1_000 });
      return;
    } catch (error) {
      if (attempt === 4) {
        throw error;
      }
    }
  }
}
