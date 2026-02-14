import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Checkbox } from '@/components/ui/checkbox';

import { authClient } from '@/features/auth/client';

export const AutoAcceptToggle = () => {
  const { t } = useTranslation(['account']);
  const session = authClient.useSession();

  const updateAutoAccept = useMutation(
    orpc.account.updateInfo.mutationOptions({
      onSuccess: async () => {
        await session.refetch();
        toast.success(t('account:autoAccept.successMessage'));
      },
      onError: () => toast.error(t('account:autoAccept.errorMessage')),
    })
  );

  return (
    <Checkbox
      checked={session.data?.user.autoAccept ?? false}
      disabled={updateAutoAccept.isPending}
      onCheckedChange={(checked) => {
        updateAutoAccept.mutate({
          name: session.data?.user.name ?? '',
          phone: session.data?.user.phone ?? null,
          autoAccept: !!checked,
        });
      }}
    >
      <span className="text-muted-foreground">
        {t('account:userCard.autoAccept.description')}
      </span>
    </Checkbox>
  );
};
