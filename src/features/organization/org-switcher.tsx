import { useQueryClient } from '@tanstack/react-query';
import { useMatch, useParams, useRouter } from '@tanstack/react-router';
import { BuildingIcon, CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { authClient } from '@/features/auth/client';
import { useOrganizations } from '@/features/organization/use-organizations';

export const OrgSwitcher = () => {
  const { t } = useTranslation(['organization']);
  const session = authClient.useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const params = useParams({ strict: false }); // works even outside org routes
  const match = useMatch({ strict: false });

  const { organizations, activeOrg, activeOrgId } = useOrganizations();

  const isManagerRoute = match?.routeId?.startsWith('/manager');

  const filteredOrgs = isManagerRoute
    ? organizations?.filter((org) =>
        authClient.organization.checkRolePermission({
          role: org.role as 'owner' | 'admin' | 'member',
          permissions: { organization: ['delete'] },
        })
      )
    : organizations;

  const handleSwitch = async (org: { id: string; slug: string }) => {
    if (org.id === activeOrgId) return;

    await authClient.organization.setActive({ organizationId: org.id });
    await session.refetch();

    // Only navigate if current route has orgSlug param
    if (params?.orgSlug) {
      router.navigate({
        to: '.', // stay on same route
        params: {
          ...params,
          orgSlug: org.slug,
        },
        replace: true,
      });
    }

    // Invalidate all queries since data is org-scoped
    await queryClient.invalidateQueries();
  };

  if (!filteredOrgs || filteredOrgs.length <= 1) {
    if (!activeOrg) return null;

    return (
      <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium">
        <BuildingIcon className="size-4 shrink-0 text-neutral-500" />
        <span className="truncate">{activeOrg.name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800">
        <BuildingIcon className="size-4 shrink-0 text-neutral-500" />
        <span className="flex-1 truncate text-left">
          {activeOrg?.name ?? t('organization:switcher.label')}
        </span>
        <ChevronsUpDownIcon className="size-4 shrink-0 text-neutral-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56" align="start" sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {t('organization:switcher.label')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filteredOrgs.map((org) => (
            <DropdownMenuItem key={org.id} onClick={() => handleSwitch(org)}>
              <span className="flex-1 truncate">{org.name}</span>
              {org.id === activeOrgId && (
                <CheckIcon className="size-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
