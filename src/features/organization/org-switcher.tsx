import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BuildingIcon, CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

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

export const OrgSwitcher = () => {
  const { t } = useTranslation(['organization']);
  const session = authClient.useSession();
  const queryClient = useQueryClient();

  const orgsQuery = useQuery(
    orpc.organization.getMyOrganizations.queryOptions()
  );

  const activeOrgId = session.data?.session?.activeOrganizationId;
  const activeOrg = orgsQuery.data?.find((org) => org.id === activeOrgId);

  const handleSwitch = async (organizationId: string) => {
    if (organizationId === activeOrgId) return;

    await authClient.organization.setActive({ organizationId });
    await session.refetch();
    // Invalidate all queries since data is org-scoped
    await queryClient.invalidateQueries();
  };

  if (!orgsQuery.data || orgsQuery.data.length <= 1) {
    // Don't show switcher if user only has 1 org
    if (activeOrg) {
      return (
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium">
          <BuildingIcon className="size-4 shrink-0 text-neutral-500" />
          <span className="truncate">{activeOrg.name}</span>
        </div>
      );
    }
    return null;
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
          {orgsQuery.data.map((org) => (
            <DropdownMenuItem key={org.id} onClick={() => handleSwitch(org.id)}>
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
