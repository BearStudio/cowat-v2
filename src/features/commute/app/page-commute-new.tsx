import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useCanGoBack, useParams, useRouter } from '@tanstack/react-router';
import { PenLineIcon } from 'lucide-react';
import { useState } from 'react';
import { FormStateSubscribe, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { FormCommute } from '@/features/commute/app/form-commute';
import { TemplatePicker } from '@/features/commute/app/template-picker';
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

const DEFAULT_VALUES: Omit<FormFieldsCommute, 'date'> = {
  seats: 1,
  type: 'ROUND',
  comment: null,
  stops: [{ locationId: '', outwardTime: '', inwardTime: null }],
};

export const PageCommuteNew = ({ search }: { search: { date?: Date } }) => {
  const { t } = useTranslation(['commute']);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { orgSlug } = useParams({ strict: false });
  const [showForm, setShowForm] = useState(false);

  const form = useForm<FormFieldsCommute>({
    resolver: zodResolver(zFormFieldsCommute()),
    defaultValues: { ...DEFAULT_VALUES, date: search.date },
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
            to: '/app/$orgSlug/commutes',
            params: { orgSlug: orgSlug! },
            replace: true,
            ignoreBlocker: true,
          });
        }
      },
    })
  );

  if (!showForm) {
    return (
      <PageLayout>
        <PageLayoutTopBar startActions={<BackButton />}>
          <PageLayoutTopBarTitle>
            {t('commute:new.title')}
          </PageLayoutTopBarTitle>
        </PageLayoutTopBar>
        <PageLayoutContent containerClassName="gap-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setShowForm(true)}
          >
            <PenLineIcon />
            {t('commute:templatePicker.fromScratch')}
          </Button>
          <TemplatePicker
            onSelect={(data) => {
              form.reset({ ...DEFAULT_VALUES, date: search.date, ...data });
              setShowForm(true);
            }}
          />
        </PageLayoutContent>
      </PageLayout>
    );
  }

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
