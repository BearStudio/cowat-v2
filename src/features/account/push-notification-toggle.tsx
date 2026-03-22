import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Checkbox } from '@/components/ui/checkbox';

import { AccountCardRow } from '@/features/account/account-card-row';
import { getFcmToken, isPushSupported } from '@/features/push/firebase-client';

function usePermissionState() {
  const [permission, setPermission] = useState<NotificationPermission | null>(
    isPushSupported() ? Notification.permission : null
  );

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  return { permission, requestPermission };
}

export function PushNotificationToggle({
  prefsQuery,
}: {
  prefsQuery: ReturnType<
    typeof useQuery<Array<{ channel: string; enabled: boolean }>>
  >;
}) {
  const { t } = useTranslation(['account']);
  const { permission, requestPermission } = usePermissionState();

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

  const toggleToken = useMutation(
    orpc.account.toggleFcmToken.mutationOptions()
  );

  if (permission === null) return null;

  const pushPref = prefsQuery.data?.find((p) => p.channel === 'PUSH');
  const pushEnabled = pushPref?.enabled ?? true;
  const isPending = updatePref.isPending || toggleToken.isPending;

  const handlePushChange = async (checked: boolean) => {
    if (checked && permission !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') return;
    }

    if (checked) {
      const token = await getFcmToken().catch(() => null);
      if (token) {
        await toggleToken
          .mutateAsync({ token, registered: true })
          .catch(() => null);
      }
    }

    updatePref.mutate({ channel: 'PUSH', enabled: checked });
  };

  return (
    <AccountCardRow
      label={t('account:notificationPreferences.push.label')}
      className="sm:items-center"
    >
      <Checkbox
        checked={pushEnabled && permission === 'granted'}
        disabled={isPending || permission === 'denied'}
        onCheckedChange={(checked) => {
          handlePushChange(!!checked).catch(console.error);
        }}
      >
        <span className="text-muted-foreground">
          {permission === 'denied'
            ? t('account:notificationPreferences.push.descriptionDenied')
            : t('account:notificationPreferences.push.description')}
        </span>
      </Checkbox>
    </AccountCardRow>
  );
}
