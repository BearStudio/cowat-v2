import { createFileRoute } from '@tanstack/react-router';

import { PageCommuteTemplates } from '@/features/commute-template/app/page-commute-templates';

export const Route = createFileRoute(
  '/app/$orgSlug/account/commute-templates/'
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageCommuteTemplates />;
}
