import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';

import { orpc } from '@/lib/orpc/client';

import { PageDashboard } from '@/features/dashboard/app/page-dashboard';

export const Route = createFileRoute('/app/$orgSlug/')({
  loader: ({ context }) => {
    const today = dayjs().startOf('day');
    const rangeEnd = today.add(7, 'day');

    context.queryClient.prefetchQuery(
      orpc.commute.getByDate.queryOptions({
        input: { from: today.toDate(), to: rangeEnd.toDate() },
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <PageDashboard />;
}
