import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';
import { toast } from '@/lib/toast';

import { Checkbox } from '@/components/ui/checkbox';

export const AutoAcceptToggle = () => {
  const { t } = useTranslation(['account']);
  const queryClient = useQueryClient();

  const autoAcceptQuery = useQuery(orpc.account.getAutoAccept.queryOptions());

  const updateAutoAccept = useMutation(
    orpc.account.updateAutoAccept.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          orpc.account.getAutoAccept.queryOptions()
        );
        toast.success(t('account:autoAccept.successMessage'));
      },
      onError: () => toast.error(t('account:autoAccept.errorMessage')),
    })
  );

  return (
    <Checkbox
      checked={autoAcceptQuery.data?.autoAccept ?? false}
      disabled={updateAutoAccept.isPending || autoAcceptQuery.isLoading}
      onCheckedChange={(checked) => {
        updateAutoAccept.mutate({
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
