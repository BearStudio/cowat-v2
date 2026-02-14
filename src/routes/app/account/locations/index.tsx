import { createFileRoute } from '@tanstack/react-router';

import { PageLocations } from '@/features/location/app/page-locations';

export const Route = createFileRoute('/app/account/locations/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageLocations />;
}
