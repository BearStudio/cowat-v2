import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageCommuteNew } from '@/features/commute/app/page-commute-new';

export const Route = createFileRoute('/app/commutes/new/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      date: fallback(z.coerce.date(), undefined).optional(),
    })
  ),
});

function RouteComponent() {
  const { date } = Route.useSearch();
  return <PageCommuteNew date={date} />;
}
