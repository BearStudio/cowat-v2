import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import {
  PageUsers,
  usersInfiniteOptions,
} from '@/features/user/manager/page-users';

export const Route = createFileRoute('/manager/$orgSlug/users/')({
  validateSearch: zodValidator(
    z.object({
      searchTerm: z.string().prefault(''),
    })
  ),
  component: RouteComponent,
  search: {
    middlewares: [stripSearchParams({ searchTerm: '' })],
  },
  loader: ({ context }) => {
    context.queryClient.prefetchInfiniteQuery(
      usersInfiniteOptions({ searchTerm: '' })
    );
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageUsers search={search} />;
}
