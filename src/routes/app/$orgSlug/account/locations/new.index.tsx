import { createFileRoute } from '@tanstack/react-router';

import { PageLocationNew } from '@/features/location/app/page-location-new';

export const Route = createFileRoute('/app/$orgSlug/account/locations/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgSlug } = Route.useParams();
  return <PageLocationNew orgSlug={orgSlug} />;
}
