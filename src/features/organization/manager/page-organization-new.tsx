import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';
import { useNavigateBack } from '@/hooks/use-navigate-back';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { FormOrganization } from '@/features/organization/manager/form-organization';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

const zFormFieldsOrg = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  ownerUserId: z.string().min(1),
});

export type FormFieldsOrg = z.infer<typeof zFormFieldsOrg>;

export const PageOrganizationNew = () => {
  const { t } = useTranslation(['organization']);
  const queryClient = useQueryClient();
  const { navigateBack } = useNavigateBack();

  const form = useForm<FormFieldsOrg>({
    resolver: zodResolver(zFormFieldsOrg),
    defaultValues: {
      name: '',
      slug: '',
      ownerUserId: '',
    },
  });

  const orgCreate = useMutation(
    orpc.organization.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.organization.getAll.key(),
          type: 'all',
        });

        navigateBack({ ignoreBlocker: true });
      },
      onError: () => {
        toast.error(t('organization:manager.new.createError'));
      },
    })
  );

  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
      <Form
        {...form}
        onSubmit={async (values) => {
          orgCreate.mutate(values);
        }}
      >
        <PageLayout>
          <PageLayoutTopBar
            startActions={<BackButton />}
            endActions={
              <Button
                size="sm"
                type="submit"
                className="min-w-20"
                loading={orgCreate.isPending}
              >
                {t('organization:create.submit')}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {t('organization:create.title')}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <Card>
              <CardContent>
                <FormOrganization />
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
