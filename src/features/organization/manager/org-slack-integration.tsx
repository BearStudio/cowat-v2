import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { FormFieldContainer } from '@/components/form/form-field-container';
import { FormFieldError } from '@/components/form/form-field-error';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from '@/components/ui/password-input';
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
    defaultValues: {
      enabled: false,
      token: null,
      broadcastChannelId: null,
      locale: '',
    },
  });

  useEffect(() => {
    if (configQuery.data !== undefined) {
      form.reset({
        enabled: configQuery.data?.enabled ?? false,
        token: configQuery.data?.token ?? null,
        broadcastChannelId: configQuery.data?.broadcastChannel ?? null,
        locale: configQuery.data?.locale ?? '',
      });
    }
  }, [configQuery.data, form]);

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

  const enabled = form.watch('enabled');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('organization:slack.title')}</CardTitle>
        <CardDescription>{t('organization:slack.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form} onSubmit={onSubmit} className="gap-4">
          <FormField>
            <Checkbox
              checked={enabled}
              disabled={updateConfig.isPending}
              onCheckedChange={(checked) =>
                form.setValue('enabled', !!checked, { shouldDirty: true })
              }
            >
              <span className="font-medium">
                {t('organization:slack.enabledLabel')}
              </span>
            </Checkbox>
          </FormField>

          {enabled && (
            <>
              <Separator />

              <FormField>
                <FormFieldLabel>
                  {t('organization:slack.tokenLabel')}
                </FormFieldLabel>
                <FormFieldController
                  type="custom"
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormFieldContainer>
                      <PasswordInput
                        placeholder={t('organization:slack.tokenPlaceholder')}
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                      />
                      <FormFieldError />
                    </FormFieldContainer>
                  )}
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
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateConfig.isPending || !form.formState.isDirty}
              loading={updateConfig.isPending}
            >
              {t('organization:slack.save')}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};
