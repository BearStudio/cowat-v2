import { createFileRoute } from '@tanstack/react-router';

import {
  myCommutesInfiniteOptions,
  PageCommutes,
} from '@/features/commute/app/page-commutes';

export const Route = createFileRoute('/app/$orgSlug/commutes/')({
  loader: ({ context }) => {
    context.queryClient.prefetchInfiniteQuery(myCommutesInfiniteOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <PageCommutes />;
}
