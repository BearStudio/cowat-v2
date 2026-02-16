import { createFileRoute } from '@tanstack/react-router';

import { PageDashboard } from '@/features/dashboard/app/page-dashboard';

export const Route = createFileRoute('/app/$orgSlug/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageDashboard />;
}
