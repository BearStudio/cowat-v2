import { createFileRoute } from '@tanstack/react-router';

import { PageLocations } from '@/features/location/app/page-locations';

export const Route = createFileRoute('/app/$orgSlug/account/locations/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageLocations params={params} />;
}
