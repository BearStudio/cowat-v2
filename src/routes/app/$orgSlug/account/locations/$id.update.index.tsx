import { createFileRoute } from '@tanstack/react-router';

import { PageLocationUpdate } from '@/features/location/app/page-location-update';

export const Route = createFileRoute(
  '/app/$orgSlug/account/locations/$id/update/'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageLocationUpdate params={params} />;
}
