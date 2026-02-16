import { getUiState } from '@bearstudio/ui-state';
import { ORPCError } from '@orpc/client';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AlertCircleIcon, BuildingIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/errors/page-error';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

export const PageOrganization = (props: { params?: { id: string } }) => {
  const { t } = useTranslation(['organization']);
  const id = props.params?.id;

  const orgByIdQuery = useQuery({
    ...orpc.organization.getById.queryOptions({
      input: { id: id! },
    }),
    enabled: !!id,
  });

  const activeOrgQuery = useQuery({
    ...orpc.organization.getActiveOrganization.queryOptions(),
    enabled: !id,
  });

  const orgQuery = id ? orgByIdQuery : activeOrgQuery;

  const ui = getUiState((set) => {
    if (orgQuery.status === 'pending') return set('pending');
    if (
      orgQuery.status === 'error' &&
      orgQuery.error instanceof ORPCError &&
      orgQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (orgQuery.status === 'error') return set('error');

    return set('default', { org: orgQuery.data });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar startActions={id ? <BackButton /> : undefined}>
        <PageLayoutTopBarTitle>
          {ui
            .match('pending', () => <Skeleton className="h-4 w-48" />)
            .match(['not-found', 'error'], () => (
              <AlertCircleIcon className="size-4 text-muted-foreground" />
            ))
            .match('default', ({ org }) => <>{org.name}</>)
            .exhaustive()}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('not-found', () => <PageError type="404" />)
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
                  {'createdAt' in org && (
                    <span className="text-xs text-muted-foreground">
                      {t('organization:manager.detail.createdAt', {
                        time: dayjs(org.createdAt as Date).format('DD/MM/YYYY'),
                      })}
                    </span>
                  )}
                </CardContent>
              </Card>

              <OrgInvitations orgId={org.id} invitations={org.invitations} />
              <OrgMembers orgId={org.id} members={org.members} />
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
