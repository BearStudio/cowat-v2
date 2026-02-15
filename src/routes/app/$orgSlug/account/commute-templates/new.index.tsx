import { createFileRoute } from '@tanstack/react-router';

import { PageCommuteTemplateNew } from '@/features/commute-template/app/page-commute-template-new';

export const Route = createFileRoute(
  '/app/$orgSlug/account/commute-templates/new/'
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageCommuteTemplateNew />;
}
