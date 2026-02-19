import { createFileRoute } from '@tanstack/react-router';

import { PageCommuteView } from '@/features/commute/app/page-commute-view';

export const Route = createFileRoute('/app/$orgSlug/commutes/$commuteId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { commuteId } = Route.useParams();
  return <PageCommuteView commuteId={commuteId} />;
}
