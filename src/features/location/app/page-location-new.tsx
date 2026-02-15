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

import { FormLocation } from '@/features/location/app/form-location';
import { zFormFieldsLocation } from '@/features/location/schema';
import type { OrgParams } from '@/features/organization/org-params';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageLocationNew = ({
  params: { orgSlug },
}: {
  params: OrgParams;
}) => {
  const { t } = useTranslation(['location']);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const form = useForm({
    resolver: zodResolver(zFormFieldsLocation()),
    values: {
      name: '',
      address: '',
    },
  });

  const locationCreate = useMutation(
    orpc.location.create.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        await context.client.invalidateQueries({
          queryKey: orpc.location.getAll.key(),
          type: 'all',
        });

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

  return (
    <>
      <FormStateSubscribe
        control={form.control}
        render={({ isDirty }) => <PreventNavigation shouldBlock={isDirty} />}
      />
      <Form
        {...form}
        onSubmit={(values) => {
          locationCreate.mutate(values);
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
                loading={locationCreate.isPending}
              >
                {t('location:new.submitButton')}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {t('location:new.title')}
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
