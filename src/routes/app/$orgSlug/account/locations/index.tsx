import { createFileRoute } from '@tanstack/react-router';

import { PageLocations } from '@/features/location/app/page-locations';
import { locationsInfiniteOptions } from '@/features/location/location-queries';

export const Route = createFileRoute('/app/$orgSlug/account/locations/')({
  loader: ({ context }) => {
    context.queryClient.prefetchInfiniteQuery(locationsInfiniteOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <PageLocations />;
}
