import { createFileRoute } from '@tanstack/react-router';

import { PageCommuteUpdate } from '@/features/commute/app/page-commute-update';

export const Route = createFileRoute('/app/$orgSlug/commutes/$id/update/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id, orgSlug } = Route.useParams();
  return <PageCommuteUpdate id={id} orgSlug={orgSlug} />;
}
