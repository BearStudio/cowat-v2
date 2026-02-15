import { createFileRoute } from '@tanstack/react-router';

import { PageCommutes } from '@/features/commute/app/page-commutes';

export const Route = createFileRoute('/app/$orgSlug/commutes/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageCommutes params={params} />;
}
