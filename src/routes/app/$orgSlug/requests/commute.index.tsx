import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { toNoonUTC } from '@/lib/dayjs/to-noon-utc';

import { PageCommuteRequest } from '@/features/commute/app/page-commute-request';

export const Route = createFileRoute('/app/$orgSlug/requests/commute/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      date: fallback(
        z.coerce.date().transform((d) => toNoonUTC(d)),
        undefined
      ).optional(),
    })
  ),
});

function RouteComponent() {
  const { orgSlug } = Route.useParams();
  const search = Route.useSearch();
  return <PageCommuteRequest search={search} orgSlug={orgSlug} />;
}
