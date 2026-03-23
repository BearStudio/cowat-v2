import { useMutation } from '@tanstack/react-query';
import { UsersIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';

import { authClient } from '@/features/auth/client';

export const OrgMembers = (props: {
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
  const session = authClient.useSession();
  const currentUserId = session.data?.user?.id;

  const removeMember = useMutation(
    orpc.organization.removeMember.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        await context.client.invalidateQueries({
          queryKey: orpc.organization.getActiveOrganization.key(),
        });
        toast.success(t('organization:manager.detail.removeMemberSuccess'));
      },
      onError: () => {
        toast.error(t('organization:manager.detail.removeMemberError'));
      },
    })
  );

  const updateMemberRole = useMutation({
    mutationFn: ({
      memberId,
      newRole,
    }: {
      memberId: string;
      newRole: 'owner' | 'member';
    }) => orpc.organization.updateMemberRole.call({ memberId, role: newRole }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: orpc.organization.getActiveOrganization.key(),
      });
      toast.success(t('organization:manager.detail.updateMemberRoleSuccess'));
    },
    onError: () => {
      toast.error(t('organization:manager.detail.updateMemberRoleError'));
    },
  });

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
          <DataListRow key={member.id} className="">
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
              {member.user.id !== currentUserId && member.role !== 'admin' ? (
                <select
                  value={member.role}
                  onChange={(e) =>
                    updateMemberRole.mutateAsync({
                      memberId: member.id,
                      newRole: e.target.value as 'member' | 'owner',
                    })
                  }
                  disabled={updateMemberRole.isPending}
                  className="rounded border px-2 py-1 text-sm"
                >
                  <option value="member">
                    {t('organization:members.roles.member')}
                  </option>
                  <option value="owner">
                    {t('organization:members.roles.owner')}
                  </option>
                </select>
              ) : (
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
              )}
            </DataListCell>
            {member.user.id !== currentUserId && (
              <DataListCell className="flex-none">
                <ConfirmResponsiveDrawer
                  title={member.user.name}
                  description={t(
                    'organization:manager.detail.removeMemberConfirm'
                  )}
                  confirmText={t('organization:members.remove')}
                  confirmVariant="destructive"
                  icon={<UsersIcon />}
                  onConfirm={() =>
                    removeMember.mutateAsync({
                      memberIdOrEmail: member.user.id,
                    })
                  }
                >
                  <Button
                    size="xs"
                    variant="ghost"
                    loading={removeMember.isPending}
                  >
                    <XIcon className="size-3" />
                    {t('organization:members.remove')}
                  </Button>
                </ConfirmResponsiveDrawer>
              </DataListCell>
            )}
          </DataListRow>
        ))
      )}
    </DataList>
  );
};
