import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { toNoonUTC } from '@/lib/dayjs/to-noon-utc';

import { PageCommuteNew } from '@/features/commute/app/page-commute-new';

export const Route = createFileRoute('/app/$orgSlug/commutes/new/')({
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
  const params = Route.useParams();
  const search = Route.useSearch();
  return <PageCommuteNew params={params} search={search} />;
}
