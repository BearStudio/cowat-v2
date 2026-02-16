import { createFileRoute } from '@tanstack/react-router';

import { OrgRedirect } from '@/features/organization/org-redirect';

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <OrgRedirect to="/app/$orgSlug" />;
}
