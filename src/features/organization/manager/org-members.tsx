import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
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
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const currentUserId = session.data?.user?.id;

  const removeMember = useMutation({
    mutationFn: (memberIdOrEmail: string) =>
      orpc.organization.removeMember.call({ memberIdOrEmail }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: orpc.organization.getActiveOrganization.key(),
      });
      toast.success(t('organization:manager.detail.removeMemberSuccess'));
    },
    onError: () => {
      toast.error(t('organization:manager.detail.removeMemberError'));
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
            {member.user.id !== currentUserId && (
              <DataListCell className="flex-none">
                <ConfirmResponsiveDrawer
                  description={t(
                    'organization:manager.detail.removeMemberConfirm'
                  )}
                  confirmText={t('organization:members.remove')}
                  confirmVariant="destructive"
                  onConfirm={() => removeMember.mutateAsync(member.user.id)}
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
