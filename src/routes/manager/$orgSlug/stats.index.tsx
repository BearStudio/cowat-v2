import { createFileRoute } from '@tanstack/react-router';

import { PageStats } from '@/features/stats/manager/page-stats';

export const Route = createFileRoute('/manager/$orgSlug/stats/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageStats />;
}
