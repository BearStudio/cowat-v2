import { createFileRoute } from '@tanstack/react-router';

import {
  commuteTemplatesInfiniteOptions,
  PageCommuteTemplates,
} from '@/features/commute-template/app/page-commute-templates';

export const Route = createFileRoute(
  '/app/$orgSlug/account/commute-templates/'
)({
  loader: ({ context }) => {
    context.queryClient.prefetchInfiniteQuery(
      commuteTemplatesInfiniteOptions()
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { orgSlug } = Route.useParams();
  return <PageCommuteTemplates orgSlug={orgSlug} />;
}
