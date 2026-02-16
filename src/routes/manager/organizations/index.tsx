import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { Spinner } from '@/components/ui/spinner';

import { PageOrganizations } from '@/features/organization/manager/page-organizations';
import { useOrganizations } from '@/features/organization/use-organizations';

export const Route = createFileRoute('/manager/organizations/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      searchTerm: z.string().prefault(''),
    })
  ),
  search: {
    middlewares: [stripSearchParams({ searchTerm: '' })],
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  const { activeOrg, organizations } = useOrganizations();
  const orgSlug = activeOrg?.slug ?? organizations?.[0]?.slug;

  if (!orgSlug) {
    return <Spinner full className="opacity-60" />;
  }

  return <PageOrganizations orgSlug={orgSlug} search={search} />;
}
