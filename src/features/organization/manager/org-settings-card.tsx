import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormStateSubscribe, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const zFormFields = z.object({
  name: z.string().min(1).max(100),
});

type FormFields = z.infer<typeof zFormFields>;

export const OrgSettingsCard = () => {
  const { t } = useTranslation(['organization']);
  const queryClient = useQueryClient();

  const orgQuery = useQuery(
    orpc.organization.getActiveOrganization.queryOptions()
  );

  const form = useForm<FormFields>({
    resolver: zodResolver(zFormFields),
    values: { name: orgQuery.data?.name ?? '' },
  });

  const updateOrg = useMutation(
    orpc.organization.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.organization.getActiveOrganization.key(),
        });
        form.reset({ name: form.getValues('name') });
        toast.success(t('organization:manager.account.updateSuccess'));
      },
      onError: () => {
        toast.error(t('organization:manager.account.updateError'));
      },
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('organization:manager.account.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {orgQuery.isPending ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Form
            {...form}
            onSubmit={(values) => updateOrg.mutate(values)}
            className="gap-4"
          >
            <FormField>
              <FormFieldLabel>
                {t('organization:manager.account.nameLabel')}
              </FormFieldLabel>
              <FormFieldController
                type="text"
                control={form.control}
                name="name"
              />
            </FormField>

            <div className="flex justify-end">
              <FormStateSubscribe
                control={form.control}
                render={({ isDirty }) => (
                  <Button
                    type="submit"
                    disabled={updateOrg.isPending || !isDirty}
                    loading={updateOrg.isPending}
                  >
                    {t('organization:manager.account.save')}
                  </Button>
                )}
              />
            </div>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};
