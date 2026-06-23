import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormStateSubscribe, useForm, Watch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const zFormFields = z.object({
  enabled: z.boolean(),
  token: z.string().nullable(),
  broadcastChannelId: z.string().nullable(),
  // '' means "use server default" (stored as null)
  locale: z.enum(['', 'en', 'fr']),
});

type FormFields = z.infer<typeof zFormFields>;

export const OrgSlackIntegration = () => {
  const { t } = useTranslation(['organization']);
  const queryClient = useQueryClient();

  const configQuery = useQuery(
    orpc.orgNotificationChannel.getSlack.queryOptions()
  );

  const form = useForm<FormFields>({
    resolver: zodResolver(zFormFields),
    values: {
      enabled: configQuery.data?.enabled ?? false,
      // The token is write-only: the server never returns it. Leave the field
      // empty; submitting it empty keeps the stored token unchanged.
      token: '',
      broadcastChannelId: configQuery.data?.broadcastChannel ?? '',
      locale: (configQuery.data?.locale ?? '') as 'en' | 'fr' | '',
    },
  });

  const updateConfig = useMutation(
    orpc.orgNotificationChannel.updateSlack.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.orgNotificationChannel.getSlack.key(),
        });
        toast.success(t('organization:slack.saveSuccess'));
      },
      onError: () => {
        toast.error(t('organization:slack.saveError'));
      },
    })
  );

  const onSubmit = (values: FormFields) => {
    updateConfig.mutate({
      enabled: values.enabled,
      token: values.token || null,
      broadcastChannel: values.broadcastChannelId || null,
      locale: (values.locale || null) as 'en' | 'fr' | null,
    });
    // Clear the token field once submitted: the secret is sent (or intentionally
    // left blank to keep the stored one), so the input goes back to its empty
    // state and shows the "leave empty to keep the existing token" placeholder.
    form.resetField('token', { defaultValue: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('organization:slack.title')}</CardTitle>
        <CardDescription>{t('organization:slack.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form} onSubmit={onSubmit} className="gap-4">
          <FormField>
            <FormFieldController
              type="checkbox"
              control={form.control}
              name="enabled"
              disabled={updateConfig.isPending}
            >
              <span className="font-medium">
                {t('organization:slack.enabledLabel')}
              </span>
            </FormFieldController>
          </FormField>

          <Watch
            control={form.control}
            name="enabled"
            render={(enabled) => {
              if (!enabled) return;
              return (
                <>
                  <Separator />

                  <FormField>
                    <FormFieldLabel>
                      {t('organization:slack.tokenLabel')}
                    </FormFieldLabel>
                    <FormFieldController
                      type="password"
                      control={form.control}
                      name="token"
                      placeholder={
                        configQuery.data?.hasToken
                          ? t('organization:slack.tokenPlaceholderExisting')
                          : t('organization:slack.tokenPlaceholder')
                      }
                    />
                    <FormFieldHelper>
                      {t('organization:slack.tokenHelper')}
                    </FormFieldHelper>
                  </FormField>

                  <FormField>
                    <FormFieldLabel>
                      {t('organization:slack.broadcastChannelIdLabel')}
                    </FormFieldLabel>
                    <FormFieldController
                      type="text"
                      control={form.control}
                      name="broadcastChannelId"
                      placeholder="C01234ABCDE"
                    />
                    <FormFieldHelper>
                      {t('organization:slack.broadcastChannelIdHelper')}
                    </FormFieldHelper>
                  </FormField>

                  <FormField>
                    <FormFieldLabel>
                      {t('organization:slack.localeLabel')}
                    </FormFieldLabel>
                    <FormFieldController
                      type="select"
                      control={form.control}
                      name="locale"
                      items={[
                        {
                          value: '',
                          label: t('organization:slack.localeDefault'),
                        },
                        { value: 'en', label: 'English' },
                        { value: 'fr', label: 'Français' },
                      ]}
                    />
                    <FormFieldHelper>
                      {t('organization:slack.localeHelper')}
                    </FormFieldHelper>
                  </FormField>
                </>
              );
            }}
          />

          <div className="flex justify-end">
            <FormStateSubscribe
              control={form.control}
              render={({ isDirty }) => (
                <Button
                  type="submit"
                  disabled={updateConfig.isPending || !isDirty}
                  loading={updateConfig.isPending}
                >
                  {t('organization:slack.save')}
                </Button>
              )}
            />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};
