import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

type FormFieldsOrg = z.infer<typeof zFormFieldsOrg>;

export const PageOrganizationNew = () => {
  const { t } = useTranslation(['organization']);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const queryClient = useQueryClient();

  const usersQuery = useQuery(
    orpc.user.getAll.queryOptions({
      input: { limit: 100 },
    })
  );

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

        if (canGoBack) {
          router.history.back({ ignoreBlocker: true });
        } else {
          router.navigate({ to: '..', replace: true, ignoreBlocker: true });
        }
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
                <div className="flex flex-col gap-4">
                  <FormField>
                    <FormFieldLabel>
                      {t('organization:create.name')}
                    </FormFieldLabel>
                    <FormFieldController
                      type="text"
                      control={form.control}
                      name="name"
                      autoFocus
                    />
                  </FormField>
                  <FormField>
                    <FormFieldLabel>
                      {t('organization:create.slug')}
                    </FormFieldLabel>
                    <FormFieldController
                      type="text"
                      control={form.control}
                      name="slug"
                    />
                  </FormField>
                  <FormField>
                    <FormFieldLabel>
                      {t('organization:create.owner')}
                    </FormFieldLabel>
                    <FormFieldController
                      type="select"
                      control={form.control}
                      name="ownerUserId"
                      items={
                        usersQuery.data?.items.map((user) => ({
                          value: user.id,
                          label: `${user.name} (${user.email})`,
                        })) ?? []
                      }
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
