import { useInfiniteQuery } from '@tanstack/react-query';

import { orpc } from '@/lib/orpc/client';

const LOCATIONS_QUERY_OPTIONS = {
  initialPageParam: undefined as string | undefined,
  maxPages: 1,
  getNextPageParam: (lastPage: { nextCursor?: string }) => lastPage.nextCursor,
} as const;

export const useAllLocations = () => {
  const personalQuery = useInfiniteQuery(
    orpc.location.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({ cursor, limit: 100 }),
      ...LOCATIONS_QUERY_OPTIONS,
    })
  );

  const orgQuery = useInfiniteQuery(
    orpc.orgLocation.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({ cursor, limit: 100 }),
      ...LOCATIONS_QUERY_OPTIONS,
    })
  );

  return { personalQuery, orgQuery };
};
