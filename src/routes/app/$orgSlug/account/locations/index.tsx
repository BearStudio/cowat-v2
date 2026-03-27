import { createFileRoute } from '@tanstack/react-router';

import {
  locationsInfiniteOptions,
  PageLocations,
} from '@/features/location/app/page-locations';

export const Route = createFileRoute('/app/$orgSlug/account/locations/')({
  loader: ({ context }) => {
    context.queryClient.prefetchInfiniteQuery(locationsInfiniteOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <PageLocations />;
}
