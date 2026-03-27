import { createFileRoute } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

import { PageUser } from '@/features/user/manager/page-user';

export const Route = createFileRoute('/manager/users/$id/')({
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(
      orpc.user.getById.queryOptions({ input: { id: params.id } })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <PageUser id={id} />;
}
