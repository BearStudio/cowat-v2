import { createFileRoute } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

import { PageStats } from '@/features/stats/manager/page-stats';

export const Route = createFileRoute('/manager/$orgSlug/stats/')({
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(
      orpc.stats.getAll.queryOptions({
        input: { orgSlug: params.orgSlug },
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <PageStats />;
}
