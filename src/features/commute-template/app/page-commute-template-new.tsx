import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
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

export const PageCommuteTemplateNew = ({ orgSlug }: { orgSlug: string }) => {
  const { t } = useTranslation(['commuteTemplate']);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  useShouldShowNav('desktop-only');

  const form = useForm<FormFieldsCommuteTemplate>({
    resolver: zodResolver(zFormFieldsCommuteTemplate()),
    defaultValues: {
      seats: 1,
      type: 'ROUND',
      comment: null,
      stops: [
        { locationId: '', order: 0, outwardTime: '', inwardTime: null },
        { locationId: '', order: 1, outwardTime: '', inwardTime: null },
      ],
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
            to: '/app/$orgSlug/account/commute-templates',
            params: { orgSlug },
            replace: true,
            ignoreBlocker: true,
          });
        }
      },
    })
  );

  const handleSubmit = form.handleSubmit((values) => {
    templateCreate.mutate({
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
        <MultiStepForm>
          <PageLayout>
            <PageLayoutTopBar startActions={<BackButton />}>
              <PageLayoutTopBarTitle>
                {t('commuteTemplate:new.title')}
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
                names="type"
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
              isSubmitting={templateCreate.isPending}
              submitLabel={t('commuteTemplate:stepper.submit')}
              nextLabel={t('commuteTemplate:stepper.next')}
              backLabel={t('commuteTemplate:stepper.back')}
            />
          </PageLayout>
        </MultiStepForm>
      </Form>
    </>
  );
};
