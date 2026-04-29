import { Navigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const session = authClient.useSession();

  if (session.isPending) {
    return <Spinner full className="opacity-60" />;
  }

  if (session.data?.user) {
    return <Navigate to="/app" replace />;
  }

  return <Navigate to="/landing" replace />;
}
