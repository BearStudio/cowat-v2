import { getUiState } from '@bearstudio/ui-state';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircleIcon, BuildingIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { PageError } from '@/components/errors/page-error';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DangerZone, DangerZoneCardItem } from '@/components/ui/danger-zone';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import { OrgInvitations } from '@/features/organization/manager/org-invitations';
import { OrgMembers } from '@/features/organization/manager/org-members';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageOrganization = () => {
  const { t } = useTranslation(['organization', 'common']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const orgQuery = useQuery(
    orpc.organization.getActiveOrganization.queryOptions()
  );

  const deleteOrganization = useMutation({
    mutationFn: (organizationId: string) =>
      orpc.organization.delete.call({ organizationId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: orpc.organization.getAll.key(),
      });
      toast.success(t('organization:manager.detail.deleteOrganizationSuccess'));
      navigate({ to: '/manager/organizations' });
    },
    onError: () => {
      toast.error(t('organization:manager.detail.deleteOrganizationError'));
    },
  });

  const ui = getUiState((set) => {
    if (orgQuery.status === 'pending') return set('pending');
    if (orgQuery.status === 'error') return set('error');
    return set('default', { org: orgQuery.data });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>
          {ui
            .match('pending', () => <Skeleton className="h-4 w-48" />)
            .match('error', () => (
              <AlertCircleIcon className="size-4 text-muted-foreground" />
            ))
            .match('default', ({ org }) => <>{org.name}</>)
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('error', () => <PageError type="unknown-server-error" />)
          .match('default', ({ org }) => (
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <BuildingIcon className="size-5 text-neutral-500" />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <CardTitle>{org.name}</CardTitle>
                      <CardDescription>{org.slug}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Badge variant="secondary">
                    <UsersIcon className="size-3" />
                    {t('organization:manager.detail.memberCount', {
                      count: org.members.length,
                    })}
                  </Badge>
                </CardContent>
              </Card>

              <OrgInvitations orgId={org.id} invitations={org.invitations} />
              <OrgMembers orgId={org.id} members={org.members} />

              <DangerZone>
                <DangerZoneCardItem
                  title={t(
                    'organization:manager.detail.deleteOrganizationTitle'
                  )}
                  description={t(
                    'organization:manager.detail.deleteOrganizationConfirm'
                  )}
                  confirmDescription={t(
                    'organization:manager.detail.deleteOrganizationConfirm'
                  )}
                  confirmText={t('common:actions.confirm')}
                  onConfirm={() => deleteOrganization.mutateAsync(org.id)}
                  isPending={deleteOrganization.isPending}
                  requiredConfirmation={org.slug}
                />
              </DangerZone>
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
