import { createFileRoute, Link } from '@tanstack/react-router';
import { Activity } from 'react';

import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';
import { useRedirectAfterLogin } from '@/features/auth/utils';

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
        <Link to="/login">Login</Link>
      </Activity>
    </>
  );
}
