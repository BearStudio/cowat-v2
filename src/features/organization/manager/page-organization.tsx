import { getUiState } from '@bearstudio/ui-state';
import { zodResolver } from '@hookform/resolvers/zod';
import { ORPCError } from '@orpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  AlertCircleIcon,
  BuildingIcon,
  MailIcon,
  PlusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { PageError } from '@/components/errors/page-error';
import { Form } from '@/components/form/form';
import { FormField } from '@/components/form/form-field';
import { FormFieldController } from '@/components/form/form-field-controller';
import { FormFieldLabel } from '@/components/form/form-field-label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageOrganization = (props: { params: { id: string } }) => {
  const { t } = useTranslation(['organization']);

  const orgQuery = useQuery(
    orpc.organization.getById.queryOptions({
      input: { id: props.params.id },
    })
  );

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
      <PageLayoutTopBar startActions={<BackButton />}>
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
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
              <Card className="flex-1">
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
                  <span className="text-xs text-muted-foreground">
                    {t('organization:manager.detail.createdAt', {
                      time: dayjs(org.createdAt).format('DD/MM/YYYY'),
                    })}
                  </span>
                </CardContent>
              </Card>

              <div className="flex flex-2 flex-col gap-4">
                <OrgMembers orgId={props.params.id} members={org.members} />
                <OrgInvitations
                  orgId={props.params.id}
                  invitations={org.invitations}
                />
              </div>
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};

const OrgMembers = (props: {
  orgId: string;
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  }>;
}) => {
  const { t } = useTranslation(['organization']);

  return (
    <DataList>
      <DataListRow>
        <DataListCell>
          <h2 className="text-sm font-medium">
            {t('organization:members.title')}
          </h2>
        </DataListCell>
      </DataListRow>
      {!props.members.length ? (
        <DataListEmptyState className="min-h-20">
          {t('organization:manager.detail.noMembers')}
        </DataListEmptyState>
      ) : (
        props.members.map((member) => (
          <DataListRow
            key={member.id}
            className="max-md:flex-col max-md:py-2 max-md:[&>div]:py-1"
          >
            <DataListCell className="flex-none">
              <Avatar>
                <AvatarImage
                  src={member.user.image ?? undefined}
                  alt={member.user.name ?? ''}
                />
                <AvatarFallback
                  variant="boring"
                  name={member.user.name ?? ''}
                />
              </Avatar>
            </DataListCell>
            <DataListCell>
              <DataListText className="font-medium">
                {member.user.name}
              </DataListText>
              <DataListText className="text-xs text-muted-foreground">
                {member.user.email}
              </DataListText>
            </DataListCell>
            <DataListCell className="flex-none">
              <Badge
                variant={
                  member.role === 'owner' || member.role === 'admin'
                    ? 'default'
                    : 'secondary'
                }
              >
                {t(
                  // @ts-expect-error -- dynamic i18n key
                  `organization:members.roles.${member.role}`
                )}
              </Badge>
            </DataListCell>
          </DataListRow>
        ))
      )}
    </DataList>
  );
};

const zInviteForm = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
});

const InviteForm = (props: { orgId: string }) => {
  const { t } = useTranslation(['organization']);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof zInviteForm>>({
    resolver: zodResolver(zInviteForm),
    defaultValues: { email: '', role: 'member' },
  });

  const invite = useMutation({
    mutationFn: (data: z.infer<typeof zInviteForm>) =>
      orpc.organization.adminInviteMember.call({
        organizationId: props.orgId,
        ...data,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: orpc.organization.getById.key({
          input: { id: props.orgId },
        }),
      });
      toast.success(t('organization:manager.detail.invitationSent'));
      form.reset();
    },
    onError: () => {
      toast.error(t('organization:manager.detail.invitationError'));
    },
  });

  return (
    <Form
      {...form}
      onSubmit={(data) => invite.mutate(data)}
      className="flex items-end gap-2"
    >
      <FormField className="flex-1">
        <FormFieldLabel>{t('organization:members.email')}</FormFieldLabel>
        <FormFieldController
          control={form.control}
          type="email"
          name="email"
          placeholder="user@example.com"
        />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('organization:members.role')}</FormFieldLabel>
        <FormFieldController
          control={form.control}
          type="select"
          name="role"
          items={[
            { label: t('organization:members.roles.member'), value: 'member' },
            { label: t('organization:members.roles.admin'), value: 'admin' },
          ]}
        />
      </FormField>
      <Button type="submit" size="sm" loading={invite.isPending}>
        <PlusIcon className="size-4" />
        {t('organization:members.invite')}
      </Button>
    </Form>
  );
};

const OrgInvitations = (props: {
  orgId: string;
  invitations: Array<{
    id: string;
    email: string;
    role: string | null;
    status: string;
    expiresAt: Date;
  }>;
}) => {
  const { t } = useTranslation(['organization']);
  const queryClient = useQueryClient();

  const cancelInvitation = useMutation({
    mutationFn: (invitationId: string) =>
      orpc.organization.cancelInvitation.call({ invitationId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: orpc.organization.getById.key({
          input: { id: props.orgId },
        }),
      });
      toast.success(t('organization:manager.detail.invitationCancelled'));
    },
    onError: () => {
      toast.error(t('organization:manager.detail.cancelInvitationError'));
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <InviteForm orgId={props.orgId} />
      <DataList>
        <DataListRow>
          <DataListCell>
            <h2 className="text-sm font-medium">
              {t('organization:invitations.title')}
            </h2>
          </DataListCell>
        </DataListRow>
        {!props.invitations.length ? (
          <DataListEmptyState className="min-h-20">
            {t('organization:invitations.empty')}
          </DataListEmptyState>
        ) : (
          props.invitations.map((invitation) => (
            <DataListRow
              key={invitation.id}
              className="max-md:flex-col max-md:py-2 max-md:[&>div]:py-1"
            >
              <DataListCell className="flex-none">
                <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <MailIcon className="size-4 text-neutral-500" />
                </div>
              </DataListCell>
              <DataListCell>
                <DataListText className="font-medium">
                  {invitation.email}
                </DataListText>
                <DataListText className="text-xs text-muted-foreground">
                  {t('organization:manager.detail.expiresAt', {
                    time: dayjs(invitation.expiresAt).fromNow(),
                  })}
                </DataListText>
              </DataListCell>
              <DataListCell className="flex-none">
                {invitation.role && (
                  <Badge variant="secondary">
                    {t(
                      // @ts-expect-error -- dynamic i18n key
                      `organization:members.roles.${invitation.role}`
                    )}
                  </Badge>
                )}
              </DataListCell>
              <DataListCell className="flex-none">
                <Button
                  size="xs"
                  variant="ghost"
                  loading={cancelInvitation.isPending}
                  onClick={() => cancelInvitation.mutate(invitation.id)}
                >
                  <XIcon className="size-3" />
                  {t('organization:invitations.cancel')}
                </Button>
              </DataListCell>
            </DataListRow>
          ))
        )}
      </DataList>
    </div>
  );
};
