import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { PenLineIcon } from 'lucide-react';
import { FieldPath, FormStateSubscribe, useForm, Watch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';
import { useNavigateBack } from '@/hooks/use-navigate-back';

import { BackButton } from '@/components/back-button';
import {
  Form,
  MultiStepForm,
  MultiStepFormContent,
  MultiStepFormNavigation,
  MultiStepFormStep,
} from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';

import { TemplatePicker } from '@/features/commute/app/template-picker';
import { StepDetailsCommute } from '@/features/commute/form-commute/step-details-commute';
import { StepInwardStops } from '@/features/commute/form-commute/step-inward-stops';
import { StepOutwardStops } from '@/features/commute/form-commute/step-outward-stops';
import { StepRecap } from '@/features/commute/form-commute/step-recap';
import {
  asCommuteBase,
  FormFieldsCommute,
  zFormFieldsCommute,
} from '@/features/commute/schema';
import { useShouldShowNav } from '@/layout/app/layout';
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
  stops: [
    { locationId: '', outwardTime: '', inwardTime: null },
    { locationId: '', outwardTime: '', inwardTime: null },
  ],
};

export const PageCommuteNew = ({
  search,
  orgSlug,
}: {
  search: { date?: Date; showForm?: boolean };
  orgSlug: string;
}) => {
  const { t } = useTranslation(['commute', 'common']);
  const showForm = search.showForm ?? false;
  const { navigateBack } = useNavigateBack();

  useShouldShowNav(showForm ? 'desktop-only' : 'all');

  const form = useForm<FormFieldsCommute>({
    resolver: zodResolver(zFormFieldsCommute()),
    defaultValues: { ...DEFAULT_VALUES, date: search.date },
  });

  const navigateToOpenForm = useNavigate({
    from: '/app/$orgSlug/commutes/new/',
  });

  const openForm = () => {
    navigateToOpenForm({
      search: (prev) => ({ ...prev, showForm: true }),
      replace: true,
    });
  };

  const commuteCreate = useMutation(
    orpc.commute.create.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        await context.client.invalidateQueries({
          queryKey: orpc.commute.getMyCommutes.key(),
          type: 'all',
        });

        navigateBack({
          ignoreBlocker: true,
          to: '/app/$orgSlug/commutes',
          params: { orgSlug },
        });
      },
    })
  );

  const handleSubmit = form.handleSubmit((values) => {
    commuteCreate.mutate({
      ...values,
      stops: values.stops.map((stop, index) => ({ ...stop, order: index })),
    });
  });

  if (!showForm) {
    return (
      <PageLayout>
        <PageLayoutTopBar startActions={<BackButton />}>
          <PageLayoutTopBarTitle>
            {t('commute:new.title')}
          </PageLayoutTopBarTitle>
        </PageLayoutTopBar>
        <PageLayoutContent containerClassName="gap-4">
          <Button variant="secondary" className="w-full" onClick={openForm}>
            <PenLineIcon />
            {t('commute:templatePicker.fromScratch')}
          </Button>
          <TemplatePicker
            onSelect={(data) => {
              form.reset({ ...DEFAULT_VALUES, date: search.date, ...data });
              openForm();
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
      <Form {...form} noHtmlForm>
        <MultiStepForm>
          <PageLayout>
            <PageLayoutTopBar startActions={<BackButton />}>
              <PageLayoutTopBarTitle>
                {t('commute:new.title')}
              </PageLayoutTopBarTitle>
            </PageLayoutTopBar>
            <PageLayoutContent>
              <MultiStepFormContent />
              <MultiStepFormStep
                name={t('commute:stepper.details')}
                onNext={async () => {
                  const date = form.getValues('date');
                  if (dayjs(date).isBefore(dayjs(), 'day')) {
                    form.setError('date', {
                      message: t('commute:form.errors.datePast'),
                    });
                    return false;
                  }
                  return await form.trigger(['seats', 'type']);
                }}
              >
                <StepDetailsCommute />
              </MultiStepFormStep>
              <MultiStepFormStep
                name={t('commute:stepper.stops')}
                onNext={() => {
                  const stops = form.getValues('stops');
                  return form.trigger(
                    stops.flatMap((_, i) => [
                      `stops.${i}.locationId` as FieldPath<FormFieldsCommute>,
                      `stops.${i}.outwardTime` as FieldPath<FormFieldsCommute>,
                    ])
                  );
                }}
              >
                <StepOutwardStops
                  {...asCommuteBase(form)}
                  ns="commute"
                  defaultStop={{
                    locationId: '',
                    outwardTime: '',
                    inwardTime: null,
                  }}
                />
              </MultiStepFormStep>
              <Watch
                control={form.control}
                name="type"
                render={(type) =>
                  type === 'ROUND' ? (
                    <MultiStepFormStep
                      name={t('commute:stepper.inwardStops')}
                      onNext={() => {
                        const stops = form.getValues('stops');
                        return form.trigger(
                          stops.map(
                            (_, i) =>
                              `stops.${i}.inwardTime` as FieldPath<FormFieldsCommute>
                          )
                        );
                      }}
                    >
                      <StepInwardStops {...asCommuteBase(form)} ns="commute" />
                    </MultiStepFormStep>
                  ) : null
                }
              />
              <MultiStepFormStep name={t('commute:stepper.recap')}>
                <StepRecap {...asCommuteBase(form)} ns="commute" />
              </MultiStepFormStep>
            </PageLayoutContent>
            <MultiStepFormNavigation
              onSubmit={handleSubmit}
              isSubmitting={commuteCreate.isPending}
              submitLabel={t('commute:stepper.submit')}
              nextLabel={t('commute:stepper.next')}
              backLabel={t('commute:stepper.back')}
            />
          </PageLayout>
        </MultiStepForm>
      </Form>
    </>
  );
};
