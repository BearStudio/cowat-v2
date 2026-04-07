import { createFileRoute } from '@tanstack/react-router';
import { Activity } from 'react';

import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { useRedirectAfterLogin } from '@/features/auth/utils';
import { PageLanding } from '@/features/landing/page-landing';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const session = authClient.useSession();
  useRedirectAfterLogin();

  return (
    <>
      {session.isPending && <Spinner full />}
      <Activity mode={session.isPending ? 'hidden' : 'visible'}>
        <PageLanding />
      </Activity>
    </>
  );
}
