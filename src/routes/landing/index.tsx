import { createFileRoute } from '@tanstack/react-router';

import { PageLanding } from '@/features/landing/page-landing';

export const Route = createFileRoute('/landing/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageLanding />;
}
