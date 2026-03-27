import { createFileRoute } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

import { PageUserUpdate } from '@/features/user/manager/page-user-update';

export const Route = createFileRoute('/manager/users/$id/update/')({
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(
      orpc.user.getById.queryOptions({ input: { id: params.id } })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageUserUpdate params={params} />;
}
