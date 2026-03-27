import { createFileRoute } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

import { PageCommuteTemplateUpdate } from '@/features/commute-template/app/page-commute-template-update';

export const Route = createFileRoute(
  '/app/$orgSlug/account/commute-templates/$id/update/'
)({
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(
      orpc.commuteTemplate.getById.queryOptions({
        input: { id: params.id },
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id, orgSlug } = Route.useParams();
  return <PageCommuteTemplateUpdate id={id} orgSlug={orgSlug} />;
}
