import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { MailIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';

import { FormInvite } from '@/features/organization/manager/form-invite';

export const OrgInvitations = (props: {
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
        queryKey: orpc.organization.getActiveOrganization.key(),
      });
      toast.success(t('organization:manager.detail.invitationCancelled'));
    },
    onError: () => {
      toast.error(t('organization:manager.detail.cancelInvitationError'));
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <FormInvite />
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
