import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, emailOTP, openAPI, organization } from 'better-auth/plugins';
import { match } from 'ts-pattern';

import i18n from '@/lib/i18n';

import TemplateLoginCode from '@/emails/templates/login-code';
import TemplateOrgInvitation from '@/emails/templates/org-invitation';
import { envClient } from '@/env/client';
import { envServer } from '@/env/server';
import {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_EMAIL_OTP_MOCKED,
  AUTH_INVITATION_EXPIRATION_IN_SECONDS,
  AUTH_SIGNUP_ENABLED,
} from '@/features/auth/config';
import { permissions } from '@/features/auth/permissions';
import { db } from '@/server/db';
import { sendEmail } from '@/server/email';
import { getUserLanguage } from '@/server/utils';

export type Auth = typeof auth;
export const auth = betterAuth({
  session: {
    expiresIn: envServer.AUTH_SESSION_EXPIRATION_IN_SECONDS,
    updateAge: envServer.AUTH_SESSION_UPDATE_AGE_IN_SECONDS,
  },
  trustedOrigins: (request) => {
    const origins: string[] = [...(envServer.AUTH_TRUSTED_ORIGINS ?? [])];
    // In dev, allow local network access (e.g. testing from other devices)
    if (import.meta.env.DEV && request) {
      const origin = request.headers.get('origin');
      if (origin) {
        try {
          const host = new URL(origin).hostname;
          if (
            host === 'localhost' ||
            host === '127.0.0.1' ||
            host.startsWith('192.168.') ||
            host.startsWith('10.') ||
            /^172\.(1[6-9]|2\d|3[01])\./.test(host)
          ) {
            origins.push(origin);
          }
        } catch {
          // invalid URL, ignore
        }
      }
    }
    return origins;
  },
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      onboardedAt: {
        type: 'date',
      },
      phone: {
        type: 'string',
        required: false,
      },
      autoAccept: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
  onAPIError: {
    throw: true,
    errorURL: '/login/error',
  },
  socialProviders: {
    github: {
      enabled: !!(envServer.GITHUB_CLIENT_ID && envServer.GITHUB_CLIENT_SECRET),
      clientId: envServer.GITHUB_CLIENT_ID!,
      clientSecret: envServer.GITHUB_CLIENT_SECRET!,
      disableImplicitSignUp: !AUTH_SIGNUP_ENABLED,
    },
  },

  plugins: [
    expo(), // Allows an Expo native app to use auth, can be delete if no needed
    openAPI({
      disableDefaultReference: true, // Use custom exposition in /routes/api/openapi folder
    }),
    admin({
      ...permissions,
    }),
    organization({
      allowUserToCreateOrganization: false,
      organizationLimit: 100,
      membershipLimit: 200,
      invitationExpiresIn: AUTH_INVITATION_EXPIRATION_IN_SECONDS,
      async sendInvitationEmail({
        email,
        organization: org,
        inviter,
        invitation,
      }) {
        await sendEmail({
          to: email,
          subject: i18n.t('emails:orgInvitation.subject', {
            lng: getUserLanguage(),
            organizationName: org.name,
          }),
          template: (
            <TemplateOrgInvitation
              language={getUserLanguage()}
              organizationName={org.name}
              inviterName={inviter.user.name}
              acceptUrl={`${envClient.VITE_BASE_URL}/invitations/${invitation.id}`}
            />
          ),
        });
      },
    }),
    emailOTP({
      disableSignUp: !AUTH_SIGNUP_ENABLED,
      expiresIn: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES * 60,
      // Use predictable mocked code in dev
      ...(import.meta.env.DEV
        ? { generateOTP: () => AUTH_EMAIL_OTP_MOCKED }
        : undefined),
      async sendVerificationOTP({ email, otp, type }) {
        await match(type)
          .with('sign-in', async () => {
            await sendEmail({
              to: email,
              subject: i18n.t('emails:loginCode.subject', {
                lng: getUserLanguage(),
              }),
              template: (
                <TemplateLoginCode language={getUserLanguage()} code={otp} />
              ),
            });
          })
          .with('email-verification', async () => {
            throw new Error(
              'email-verification email not implemented, update the /app/server/auth.tsx file'
            );
          })
          .with('forget-password', async () => {
            throw new Error(
              'forget-password email not implemented, update the /app/server/auth.tsx file'
            );
          })
          .exhaustive();
      },
    }),
  ],
});
