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

import { FormLocation } from '@/features/location/app/form-location';
import { zFormFieldsLocation } from '@/features/location/schema';
import type { OrgParams } from '@/features/organization/org-params';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageLocationUpdate = (props: {
  params: OrgParams & { id: string };
}) => {
  const { t } = useTranslation(['location']);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { orgSlug } = props.params;

  const locationQuery = useQuery(
    orpc.location.getById.queryOptions({ input: { id: props.params.id } })
  );

  const locationUpdate = useMutation(
    orpc.location.update.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        await Promise.all([
          context.client.invalidateQueries({
            queryKey: orpc.location.getById.key({
              input: { id: props.params.id },
            }),
          }),
          context.client.invalidateQueries({
            queryKey: orpc.location.getAll.key(),
            type: 'all',
          }),
        ]);

        if (canGoBack) {
          router.history.back({ ignoreBlocker: true });
        } else {
          router.navigate({
            to: '/app/$orgSlug/account/locations',
            params: { orgSlug },
            replace: true,
            ignoreBlocker: true,
          });
        }
      },
    })
  );

  const form = useForm({
    resolver: zodResolver(zFormFieldsLocation()),
    values: {
      name: locationQuery.data?.name ?? '',
      address: locationQuery.data?.address ?? '',
    },
  });

  const ui = getUiState((set) => {
    if (locationQuery.status === 'pending') return set('pending');
    if (locationQuery.status === 'error') return set('error');
    return set('default', { location: locationQuery.data });
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
          locationUpdate.mutate({
            id: props.params.id,
            name: values.name,
            address: values.address,
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
                loading={locationUpdate.isPending}
              >
                {t('location:update.submitButton')}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {ui
                .match('pending', () => <Skeleton className="h-4 w-48" />)
                .match('error', () => (
                  <AlertCircleIcon className="size-4 text-muted-foreground" />
                ))
                .match('default', ({ location }) => <>{location.name}</>)
                .exhaustive()}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <Card>
              <CardContent>
                <FormLocation />
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
