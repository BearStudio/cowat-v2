import { createFileRoute } from '@tanstack/react-router';

import { OrgRedirect } from '@/features/organization/org-redirect';

export const Route = createFileRoute('/manager/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <OrgRedirect to="/manager/$orgSlug/users" />;
}
