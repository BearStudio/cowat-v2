import { createFileRoute } from '@tanstack/react-router';

import { PageCommuteNew } from '@/features/commute/app/page-commute-new';

export const Route = createFileRoute('/app/commutes/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageCommuteNew />;
}
