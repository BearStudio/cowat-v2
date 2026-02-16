import { createFileRoute } from '@tanstack/react-router';

import { PageCommuteTemplateUpdate } from '@/features/commute-template/app/page-commute-template-update';

export const Route = createFileRoute(
  '/app/$orgSlug/account/commute-templates/$id/update/'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { id, orgSlug } = Route.useParams();
  return <PageCommuteTemplateUpdate id={id} orgSlug={orgSlug} />;
}
