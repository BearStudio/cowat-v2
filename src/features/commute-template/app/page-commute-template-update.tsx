import { getUiState } from '@bearstudio/ui-state';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { AlertCircleIcon } from 'lucide-react';
import { FieldPath, FormStateSubscribe, useForm, Watch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import {
  Form,
  MultiStepForm,
  MultiStepFormContent,
  MultiStepFormNavigation,
  MultiStepFormStep,
} from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Skeleton } from '@/components/ui/skeleton';

import { StepDetailsTemplate } from '@/features/commute/form-commute/step-details-template';
import { StepInwardStops } from '@/features/commute/form-commute/step-inward-stops';
import { StepOutwardStops } from '@/features/commute/form-commute/step-outward-stops';
import { StepRecap } from '@/features/commute/form-commute/step-recap';
import { asCommuteBase } from '@/features/commute/schema';
import {
  FormFieldsCommuteTemplate,
  zFormFieldsCommuteTemplate,
} from '@/features/commute-template/schema';
import { useShouldShowNav } from '@/layout/app/layout';
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
  useShouldShowNav('desktop-only');

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
    defaultValues: {
      type: 'ROUND',
      name: '',
      seats: 1,
      comment: null,
      stops: [],
    },
    values: templateQuery.data
      ? {
          name: templateQuery.data.name,
          seats: templateQuery.data.seats,
          type: templateQuery.data.type,
          comment: templateQuery.data.comment ?? null,
          stops: templateQuery.data.stops.map((stop) => ({
            locationId: stop.locationId,
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

  const handleSubmit = form.handleSubmit((values) => {
    templateUpdate.mutate({ id: props.id, ...values });
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
                  .match('default', ({ template }) => <>{template.name}</>)
                  .exhaustive()}
              </PageLayoutTopBarTitle>
            </PageLayoutTopBar>
            <PageLayoutContent>
              <MultiStepFormContent />
              <MultiStepFormStep
                name={t('commuteTemplate:stepper.details')}
                onNext={() => form.trigger(['name', 'seats', 'type'])}
              >
                <StepDetailsTemplate />
              </MultiStepFormStep>
              <MultiStepFormStep
                name={t('commuteTemplate:stepper.stops')}
                onNext={() => {
                  const stops = form.getValues('stops');
                  return form.trigger(
                    stops.flatMap((_, i) => [
                      `stops.${i}.locationId` as FieldPath<FormFieldsCommuteTemplate>,
                      `stops.${i}.outwardTime` as FieldPath<FormFieldsCommuteTemplate>,
                    ])
                  );
                }}
              >
                <StepOutwardStops
                  {...asCommuteBase(form)}
                  ns="commuteTemplate"
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
                      name={t('commuteTemplate:stepper.inwardStops')}
                      onNext={() => {
                        const stops = form.getValues('stops');
                        return form.trigger(
                          stops.map(
                            (_, i) =>
                              `stops.${i}.inwardTime` as FieldPath<FormFieldsCommuteTemplate>
                          )
                        );
                      }}
                    >
                      <StepInwardStops
                        {...asCommuteBase(form)}
                        ns="commuteTemplate"
                      />
                    </MultiStepFormStep>
                  ) : null
                }
              />
              <MultiStepFormStep name={t('commuteTemplate:stepper.recap')}>
                <StepRecap {...asCommuteBase(form)} ns="commuteTemplate" />
              </MultiStepFormStep>
            </PageLayoutContent>
            <MultiStepFormNavigation
              onSubmit={handleSubmit}
              isSubmitting={templateUpdate.isPending}
              submitLabel={t('commuteTemplate:update.submitButton')}
              nextLabel={t('commuteTemplate:stepper.next')}
              backLabel={t('commuteTemplate:stepper.back')}
            />
          </PageLayout>
        </MultiStepForm>
      </Form>
    </>
  );
};
