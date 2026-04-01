import { orpc } from '@/lib/orpc/client';

export const locationsInfiniteOptions = () =>
  orpc.location.getAll.infiniteOptions({
    input: (cursor: string | undefined) => ({
      cursor,
    }),
    initialPageParam: undefined,
    maxPages: 10,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
