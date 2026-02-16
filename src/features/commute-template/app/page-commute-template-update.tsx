import { getUiState } from '@bearstudio/ui-state';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { AlertCircleIcon } from 'lucide-react';
import { FormStateSubscribe, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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

export const PageCommuteTemplateUpdate = (props: {
  id: string;
  orgSlug: string;
}) => {
  const { t } = useTranslation(['commuteTemplate']);
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const templateQuery = useQuery(
    orpc.commuteTemplate.getById.queryOptions({
      input: { id: props.id },
    })
  );

  const templateUpdate = useMutation(
    orpc.commuteTemplate.update.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        await Promise.all([
          context.client.invalidateQueries({
            queryKey: orpc.commuteTemplate.getById.key({
              input: { id: props.id },
            }),
          }),
          context.client.invalidateQueries({
            queryKey: orpc.commuteTemplate.getAll.key(),
            type: 'all',
          }),
        ]);

        if (canGoBack) {
          router.history.back({ ignoreBlocker: true });
        } else {
          router.navigate({
            to: '/app/$orgSlug/account/commute-templates',
            params: { orgSlug: props.orgSlug },
            replace: true,
            ignoreBlocker: true,
          });
        }
      },
    })
  );

  const form = useForm<FormFieldsCommuteTemplate>({
    resolver: zodResolver(zFormFieldsCommuteTemplate()),
    values: templateQuery.data
      ? {
          name: templateQuery.data.name,
          seats: templateQuery.data.seats,
          type: templateQuery.data.type,
          comment: templateQuery.data.comment ?? null,
          stops: templateQuery.data.stops.map((stop) => ({
            locationId: stop.locationId,
            order: stop.order,
            outwardTime: stop.outwardTime,
            inwardTime: stop.inwardTime ?? null,
          })),
        }
      : undefined,
  });

  const ui = getUiState((set) => {
    if (templateQuery.status === 'pending') return set('pending');
    if (templateQuery.status === 'error') return set('error');
    return set('default', { template: templateQuery.data });
  });

  return (
    <>
      <FormStateSubscribe
        control={form.control}
        render={({ isDirty }) => <PreventNavigation shouldBlock={isDirty} />}
      />
      <Form
        {...form}
        onSubmit={(values) => {
          templateUpdate.mutate({
            id: props.id,
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
                loading={templateUpdate.isPending}
              >
                {t('commuteTemplate:update.submitButton')}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {ui
                .match('pending', () => <Skeleton className="h-4 w-48" />)
                .match('error', () => (
                  <AlertCircleIcon className="size-4 text-muted-foreground" />
                ))
                .match('default', ({ template }) => <>{template.name}</>)
                .exhaustive()}
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
