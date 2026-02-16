import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
  organizationClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { envClient } from '@/env/client';
import type { Auth } from '@/server/auth';

import { organizationPermissions } from './organization-permissions';
import { permissions } from './permissions';

export const authClient = createAuthClient({
  baseURL:
    typeof window === 'undefined'
      ? envClient.VITE_BASE_URL
      : window.location.origin,
  plugins: [
    inferAdditionalFields<Auth>(),
    adminClient({
      ...permissions,
    }),
    emailOTPClient(),
    organizationClient({ ...organizationPermissions }),
  ],
});
