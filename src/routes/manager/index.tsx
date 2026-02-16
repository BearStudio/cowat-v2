import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';

import { PageNoOrganization } from '@/features/organization/page-no-organization';
import { useOrganizations } from '@/features/organization/use-organizations';

export const Route = createFileRoute('/manager/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { organizations, activeOrg, isPending } = useOrganizations();

  useEffect(() => {
    if (!organizations || organizations.length === 0) return;

    const targetOrg = activeOrg ?? organizations[0];

    if (targetOrg) {
      navigate({
        to: '/manager/$orgSlug/users',
        params: { orgSlug: targetOrg.slug },
        replace: true,
      });
    }
  }, [organizations, activeOrg, navigate]);

  if (isPending) {
    return <Spinner full className="opacity-60" />;
  }

  if (!organizations || organizations.length === 0) {
    return <PageNoOrganization />;
  }

  return <Spinner full className="opacity-60" />;
}
