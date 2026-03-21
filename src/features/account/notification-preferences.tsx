import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { AccountCardRow } from '@/features/account/account-card-row';
import {
  getFcmToken,
  isPushSupported,
} from '@/features/notification/firebase-client';

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

  const registerToken = useMutation(
    orpc.account.registerFcmToken.mutationOptions()
  );

  // null = not yet determined (SSR or unsupported browser — row stays hidden)
  const [permissionState, setPermissionState] =
    useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (isPushSupported()) {
      setPermissionState(Notification.permission);
    }
  }, []);

  // No row for SLACK/PUSH means enabled (default true)
  const slackPref = prefsQuery.data?.find((p) => p.channel === 'SLACK');
  const slackEnabled = slackPref?.enabled ?? true;

  const pushPref = prefsQuery.data?.find((p) => p.channel === 'PUSH');
  const pushEnabled = pushPref?.enabled ?? true;

  const handlePushChange = async (checked: boolean) => {
    if (checked && permissionState !== 'granted') {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission !== 'granted') return;
    }

    if (checked) {
      const token = await getFcmToken().catch(() => null);
      if (token) {
        await registerToken.mutateAsync({ token }).catch(() => null);
      }
    }

    updatePref.mutate({ channel: 'PUSH', enabled: checked });
  };

  const isPending = updatePref.isPending || registerToken.isPending;

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
      {permissionState !== null && (
        <AccountCardRow
          label={t('account:notificationPreferences.push.label')}
          className="sm:items-center"
        >
          <Checkbox
            checked={pushEnabled && permissionState === 'granted'}
            disabled={isPending || permissionState === 'denied'}
            onCheckedChange={(checked) => {
              handlePushChange(!!checked).catch(console.error);
            }}
          >
            <span className="text-muted-foreground">
              {permissionState === 'denied'
                ? t('account:notificationPreferences.push.descriptionDenied')
                : t('account:notificationPreferences.push.description')}
            </span>
          </Checkbox>
        </AccountCardRow>
      )}
    </Card>
  );
};
