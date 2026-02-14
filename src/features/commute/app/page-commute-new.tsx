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

import { FormCommute } from '@/features/commute/app/form-commute';
import {
  FormFieldsCommute,
  zFormFieldsCommute,
} from '@/features/commute/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageCommuteNew = () => {
  const { t } = useTranslation(['commute']);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const form = useForm<FormFieldsCommute>({
    resolver: zodResolver(zFormFieldsCommute()),
    defaultValues: {
      seats: 1,
      type: 'ROUND',
      comment: null,
      stops: [{ locationId: '', outwardTime: '', inwardTime: null }],
    },
  });

  const commuteCreate = useMutation(
    orpc.commute.create.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        await context.client.invalidateQueries({
          queryKey: orpc.commute.getMyCommutes.key(),
          type: 'all',
        });

        if (canGoBack) {
          router.history.back({ ignoreBlocker: true });
        } else {
          router.navigate({
            to: '/app/commutes',
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
          commuteCreate.mutate({
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
                loading={commuteCreate.isPending}
              >
                {t('commute:new.submitButton')}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {t('commute:new.title')}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <Card>
              <CardContent>
                <FormCommute />
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
