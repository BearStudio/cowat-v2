import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { FormStateSubscribe, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { FormCommuteTemplate } from '@/features/commute-template/app/form-commute-template';
import {
  FormFieldsCommuteTemplate,
  zFormFieldsCommuteTemplate,
} from '@/features/commute-template/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageCommuteTemplateNew = () => {
  const { t } = useTranslation(['commuteTemplate']);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const form = useForm<FormFieldsCommuteTemplate>({
    resolver: zodResolver(zFormFieldsCommuteTemplate()),
    defaultValues: {
      seats: 1,
      type: 'ROUND',
      outwardTime: '',
      inwardTime: null,
      comment: null,
      stops: [{ locationId: '', order: 0 }],
    },
  });

  const templateCreate = useMutation(
    orpc.commuteTemplate.create.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        await context.client.invalidateQueries({
          queryKey: orpc.commuteTemplate.getAll.key(),
          type: 'all',
        });

        if (canGoBack) {
          router.history.back({ ignoreBlocker: true });
        } else {
          router.navigate({
            to: '/app/account/commute-templates',
            replace: true,
            ignoreBlocker: true,
          });
        }
      },
    })
  );

  return (
    <>
      <FormStateSubscribe
        control={form.control}
        render={({ isDirty }) => <PreventNavigation shouldBlock={isDirty} />}
      />
      <Form
        {...form}
        onSubmit={(values) => {
          templateCreate.mutate({
            ...values,
            stops: values.stops.map((stop, index) => ({
              ...stop,
              order: index,
            })),
          });
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
                loading={templateCreate.isPending}
              >
                {t('commuteTemplate:new.submitButton')}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {t('commuteTemplate:new.title')}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <Card>
              <CardContent>
                <FormCommuteTemplate />
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
