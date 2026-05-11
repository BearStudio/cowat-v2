import { createFileRoute } from '@tanstack/react-router';

import { locationsInfiniteOptions } from '@/features/location/location-queries';
import { PageStatistics } from '@/features/stats/app/page-statistics';

export const Route = createFileRoute('/app/$orgSlug/account/statistics/')({
  loader: ({ context }) => {
    context.queryClient.prefetchInfiniteQuery(locationsInfiniteOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <PageStatistics />;
}
