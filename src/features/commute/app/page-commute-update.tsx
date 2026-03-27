import { getUiState } from '@bearstudio/ui-state';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircleIcon, AlertTriangleIcon } from 'lucide-react';
import { useMemo } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import { StepDetailsCommuteUpdate } from '@/features/commute/form-commute/step-details-commute-update';
import { StepInwardStops } from '@/features/commute/form-commute/step-inward-stops';
import { StepOutwardStops } from '@/features/commute/form-commute/step-outward-stops';
import { StepRecap } from '@/features/commute/form-commute/step-recap';
import {
  asCommuteBase,
  FormFieldsCommuteUpdate,
  type StopPassenger,
  zFormFieldsCommuteUpdate,
} from '@/features/commute/schema';
import { useShouldShowNav } from '@/layout/app/layout';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageCommuteUpdate = (props: { id: string; orgSlug: string }) => {
  const { t } = useTranslation(['commute']);
  const { navigateBack } = useNavigateBack();
  useShouldShowNav('desktop-only');

  const commuteQuery = useQuery(
    orpc.commute.getByIdEnriched.queryOptions({
      input: { id: props.id },
    })
  );

  const passengersByLocationId = useMemo(() => {
    const map = new Map<string, StopPassenger[]>();
    if (!commuteQuery.data) return map;
    for (const stop of commuteQuery.data.stops) {
      const active = stop.passengers.filter(
        (p) => p.status === 'REQUESTED' || p.status === 'ACCEPTED'
      );
      if (active.length > 0) {
        map.set(stop.locationId, active);
      }
    }
    return map;
  }, [commuteQuery.data]);

  const activePassengerCount = useMemo(() => {
    const uniqueIds = new Set<string>();
    for (const passengers of passengersByLocationId.values()) {
      for (const p of passengers) {
        uniqueIds.add(p.id);
      }
    }
    return uniqueIds.size;
  }, [passengersByLocationId]);

  const commuteUpdate = useMutation(
    orpc.commute.update.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        await Promise.all([
          context.client.invalidateQueries({
            queryKey: orpc.commute.getByIdEnriched.key({
              input: { id: props.id },
            }),
          }),
          context.client.invalidateQueries({
            queryKey: orpc.commute.getMyCommutes.key(),
            type: 'all',
          }),
        ]);

        navigateBack({
          ignoreBlocker: true,
          to: '/app/$orgSlug/commutes',
          params: { orgSlug: props.orgSlug },
        });
      },
    })
  );

  const form = useForm<FormFieldsCommuteUpdate>({
    resolver: zodResolver(zFormFieldsCommuteUpdate()),
    defaultValues: {
      type: 'ROUND',
      seats: 1,
      comment: null,
      stops: [],
    },
    values: commuteQuery.data
      ? {
          seats: commuteQuery.data.seats,
          type: commuteQuery.data.type,
          comment: commuteQuery.data.comment ?? null,
          stops: commuteQuery.data.stops.map((stop) => ({
            locationId: stop.locationId,
            outwardTime: stop.outwardTime,
            inwardTime: stop.inwardTime ?? null,
          })),
        }
      : undefined,
  });

  const ui = getUiState((set) => {
    if (commuteQuery.status === 'pending') return set('pending');
    if (commuteQuery.status === 'error') return set('error');
    return set('default', { commute: commuteQuery.data });
  });

  const handleSubmit = form.handleSubmit((values) => {
    commuteUpdate.mutate({
      id: props.id,
      ...values,
      stops: values.stops.map((stop, index) => ({ ...stop, order: index })),
    });
  });

  return (
    <>
      <FormStateSubscribe
        control={form.control}
        render={({ isDirty }) => <PreventNavigation shouldBlock={isDirty} />}
      />
      <Form {...form} noHtmlForm>
        <MultiStepForm freeNavigation>
          <PageLayout>
            <PageLayoutTopBar startActions={<BackButton />}>
              <PageLayoutTopBarTitle>
                {ui
                  .match('pending', () => <Skeleton className="h-4 w-48" />)
                  .match('error', () => (
                    <AlertCircleIcon className="size-4 text-muted-foreground" />
                  ))
                  .match('default', () => <>{t('commute:update.title')}</>)
                  .exhaustive()}
              </PageLayoutTopBarTitle>
            </PageLayoutTopBar>
            <PageLayoutContent>
              <MultiStepFormContent />
              <MultiStepFormStep
                name={t('commute:stepper.details')}
                onNext={() => form.trigger(['seats', 'type'])}
              >
                <StepDetailsCommuteUpdate />
              </MultiStepFormStep>
              <MultiStepFormStep
                name={t('commute:stepper.stops')}
                onNext={() => {
                  const stops = form.getValues('stops');
                  return form.trigger(
                    stops.flatMap((_, i) => [
                      `stops.${i}.locationId` as FieldPath<FormFieldsCommuteUpdate>,
                      `stops.${i}.outwardTime` as FieldPath<FormFieldsCommuteUpdate>,
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
                              `stops.${i}.inwardTime` as FieldPath<FormFieldsCommuteUpdate>
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
                <div className="flex flex-col gap-4 pt-3">
                  {activePassengerCount > 0 && (
                    <Alert variant="warning">
                      <AlertTriangleIcon />
                      <AlertDescription>
                        {t('commute:update.passengersWarning', {
                          count: activePassengerCount,
                        })}
                      </AlertDescription>
                    </Alert>
                  )}
                  <StepRecap
                    {...asCommuteBase(form)}
                    ns="commute"
                    passengersByLocationId={passengersByLocationId}
                  />
                </div>
              </MultiStepFormStep>
            </PageLayoutContent>
            <MultiStepFormNavigation
              onSubmit={handleSubmit}
              isSubmitting={commuteUpdate.isPending}
              submitLabel={t('commute:update.submitButton')}
              nextLabel={t('commute:stepper.next')}
              backLabel={t('commute:stepper.back')}
            />
          </PageLayout>
        </MultiStepForm>
      </Form>
    </>
  );
};
