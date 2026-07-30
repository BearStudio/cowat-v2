import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { z } from 'zod';

import { fromDateParam, toDateParam } from '@/lib/dayjs/date-param';

import { PageCommuteNew } from '@/features/commute/app/page-commute-new';

export const Route = createFileRoute('/app/$orgSlug/commutes/new/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      // Kept as a raw string on purpose: validated search params must round-trip
      // unchanged, otherwise the router endlessly redirects to normalize them.
      date: fallback(
        z
          .string()
          .refine((value) => dayjs(value).isValid())
          .optional(),
        undefined
      ).optional(),
      commuteRequestIds: z
        .preprocess(
          (val) => (typeof val === 'string' ? [val] : val),
          z.array(z.string())
        )
        .optional(),
    })
  ),
});

function RouteComponent() {
  const { orgSlug } = Route.useParams();
  const { date, commuteRequestIds } = Route.useSearch();
  const navigate = Route.useNavigate();

  const search = useMemo(
    () => ({
      date: date ? fromDateParam(date) : undefined,
      commuteRequestIds,
    }),
    [date, commuteRequestIds]
  );

  return (
    <PageCommuteNew
      search={search}
      orgSlug={orgSlug}
      onDateChange={(date) =>
        navigate({
          replace: true,
          search: (prev) => ({
            ...prev,
            date: date ? toDateParam(date) : undefined,
          }),
        })
      }
    />
  );
}
