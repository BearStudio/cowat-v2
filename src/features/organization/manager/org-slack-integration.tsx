import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormStateSubscribe, useForm, Watch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';
import { toast } from '@/lib/toast';

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
      token: configQuery.data?.token ?? null,
      broadcastChannelId: configQuery.data?.broadcastChannel ?? null,
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
                      placeholder={t('organization:slack.tokenPlaceholder')}
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
