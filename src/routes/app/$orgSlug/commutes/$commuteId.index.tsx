import { createFileRoute } from '@tanstack/react-router';

import { PageActiveCommute } from '@/features/commute/app/page-active-commute';

export const Route = createFileRoute('/app/$orgSlug/commutes/$commuteId/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageActiveCommute params={Route.useParams()} />;
}
