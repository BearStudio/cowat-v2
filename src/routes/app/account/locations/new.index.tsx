import { createFileRoute } from '@tanstack/react-router';

import { PageLocationNew } from '@/features/location/app/page-location-new';

export const Route = createFileRoute('/app/account/locations/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageLocationNew />;
}
