import { createFileRoute } from '@tanstack/react-router';

import { PageCommutes } from '@/features/commute/app/page-commutes';

export const Route = createFileRoute('/app/commutes/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageCommutes />;
}
