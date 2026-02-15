import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { AccountCardRow } from '@/features/account/account-card-row';

export const NotificationPreferences = () => {
  const { t } = useTranslation(['account']);

  const prefsQuery = useQuery(
    orpc.account.getNotificationPreferences.queryOptions()
  );

  const updatePref = useMutation(
    orpc.account.updateNotificationPreference.mutationOptions({
      onSuccess: async () => {
        await prefsQuery.refetch();
        toast.success(t('account:notificationPreferences.successMessage'));
      },
      onError: () =>
        toast.error(t('account:notificationPreferences.errorMessage')),
    })
  );

  // No row for SLACK means enabled (default true)
  const slackPref = prefsQuery.data?.find((p) => p.channel === 'SLACK');
  const slackEnabled = slackPref?.enabled ?? true;

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="gap-y-0 py-4">
        <CardTitle>{t('account:notificationPreferences.title')}</CardTitle>
      </CardHeader>
      <AccountCardRow
        label={t('account:notificationPreferences.slack.label')}
        className="sm:items-center"
      >
        <Checkbox
          checked={slackEnabled}
          disabled={updatePref.isPending}
          onCheckedChange={(checked) => {
            updatePref.mutate({
              channel: 'SLACK',
              enabled: !!checked,
            });
          }}
        >
          <span className="text-muted-foreground">
            {t('account:notificationPreferences.slack.description')}
          </span>
        </Checkbox>
      </AccountCardRow>
    </Card>
  );
};
