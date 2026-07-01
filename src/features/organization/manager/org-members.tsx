import { useMutation } from '@tanstack/react-query';
import { UsersIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';
import { queryClient } from '@/lib/tanstack-query/query-client';
import { useCan } from '@/hooks/use-can';

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  canActOnMember,
  canAssignRole,
  isNotSelfByMemberId,
} from '@/features/auth/ability/abilities';
import {
  type OrgRole,
  orgRolesNames,
} from '@/features/auth/organization-permissions';
import { WithOrgPermissions } from '@/features/auth/with-org-permissions';

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
  const { actor } = useCan();

  const roleItems = orgRolesNames.map((role) => ({
    value: role,
    label: t(`organization:members.roles.${role}`),
  }));

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

  const updateMemberRole = useMutation(
    orpc.organization.updateMemberRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.organization.getActiveOrganization.key(),
        });
        toast.success(t('organization:manager.detail.updateMemberRoleSuccess'));
      },
      onError: () => {
        toast.error(t('organization:manager.detail.updateMemberRoleError'));
      },
    })
  );

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
        props.members.map((member) => {
          const canManageMember =
            !!actor &&
            isNotSelfByMemberId(actor, member.id, '').ok &&
            canActOnMember(actor, member.role).ok;
          const canPromoteToOwner = !!actor && canAssignRole(actor, 'owner').ok;

          return (
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
              <WithOrgPermissions permissions={[{ member: ['update'] }]}>
                <DataListCell className="flex-none">
                  {canManageMember ? (
                    <Select
                      items={roleItems}
                      value={member.role}
                      onValueChange={(value) =>
                        updateMemberRole.mutateAsync({
                          memberId: member.id,
                          role: value as OrgRole,
                        })
                      }
                      disabled={updateMemberRole.isPending}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {orgRolesNames
                            .filter(
                              (role) => role !== 'owner' || canPromoteToOwner
                            )
                            .map((role) => (
                              <SelectItem key={role} value={role}>
                                {t(`organization:members.roles.${role}`)}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant={
                        member.role === 'owner' || member.role === 'admin'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {t(`organization:members.roles.${member.role}`, {
                        defaultValue: member.role,
                      })}
                    </Badge>
                  )}
                </DataListCell>
              </WithOrgPermissions>
              <WithOrgPermissions permissions={[{ member: ['delete'] }]}>
                {canManageMember && (
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
                          memberId: member.id,
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
              </WithOrgPermissions>
            </DataListRow>
          );
        })
      )}
    </DataList>
  );
};
