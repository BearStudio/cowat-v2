import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
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

  const { organizations, activeOrg, activeOrgId } = useOrganizations();

  const handleSwitch = async (org: { id: string; slug: string }) => {
    if (org.id === activeOrgId) return;

    await authClient.organization.setActive({ organizationId: org.id });
    await session.refetch();

    // If in app or manager route, navigate to the new org's URL
    const currentPath = router.state.location.pathname;
    const orgSlugPattern = /^\/(app|manager)\/[^/]+/;
    // Don't replace the slug on non-org-scoped routes like /manager/organizations
    if (
      currentPath.match(orgSlugPattern) &&
      !currentPath.startsWith('/manager/organizations') &&
      !currentPath.startsWith('/manager/users')
    ) {
      const newPath = currentPath.replace(
        orgSlugPattern,
        (_, prefix) => `/${prefix}/${org.slug}`
      );
      router.navigate({ to: newPath as string, replace: true });
    }

    // Invalidate all queries since data is org-scoped
    await queryClient.invalidateQueries();
  };

  if (!organizations || organizations.length <= 1) {
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
          {organizations.map((org) => (
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
