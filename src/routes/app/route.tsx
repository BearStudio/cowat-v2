import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/errors/page-error';

import { GuardAuthenticated } from '@/features/auth/guard-authenticated';

export const Route = createFileRoute('/app')({
  component: RouteComponent,
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: () => <PageError type="error-boundary" />,
});

function RouteComponent() {
  return (
    <GuardAuthenticated permissionApps={['app']}>
      <Outlet />
    </GuardAuthenticated>
  );
}
