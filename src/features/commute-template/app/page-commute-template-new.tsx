import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { FormStateSubscribe, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';

import { StepDetailsTemplate } from '@/features/commute/form-commute/step-details-template';
import { StepInwardStops } from '@/features/commute/form-commute/step-inward-stops';
import { StepOutwardStops } from '@/features/commute/form-commute/step-outward-stops';
import { StepRecap } from '@/features/commute/form-commute/step-recap';
import { Stepper } from '@/features/commute/form-commute/stepper';
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
  const [step, setStep] = useState(0);

  useShouldShowNav('desktop-only');

  const form = useForm<FormFieldsCommuteTemplate>({
    resolver: zodResolver(zFormFieldsCommuteTemplate()),
    defaultValues: {
      seats: 1,
      type: 'ROUND',
      comment: null,
      stops: [{ locationId: '', order: 0, outwardTime: '', inwardTime: null }],
    },
  });

  const commuteType = form.watch('type');

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

  const steps = [
    {
      label: t('commuteTemplate:stepper.details'),
      content: <StepDetailsTemplate />,
    },
    {
      label: t('commuteTemplate:stepper.stops'),
      content: (
        <StepOutwardStops
          control={form.control}
          setValue={form.setValue}
          ns="commuteTemplate"
          defaultStop={{ locationId: '', outwardTime: '', inwardTime: null }}
        />
      ),
    },
    ...(commuteType === 'ROUND'
      ? [
          {
            label: t('commuteTemplate:stepper.inwardStops'),
            content: (
              <StepInwardStops
                control={form.control}
                setValue={form.setValue}
                ns="commuteTemplate"
              />
            ),
          },
        ]
      : []),
    {
      label: t('commuteTemplate:stepper.recap'),
      content: <StepRecap control={form.control} ns="commuteTemplate" />,
    },
  ];

  const handleNext = async () => {
    let isValid = false;
    if (step === 0) {
      isValid = await form.trigger(['name', 'seats', 'type']);
    } else if (step === 1) {
      isValid = await form.trigger(['stops']);
    } else if (step === 2 && commuteType === 'ROUND') {
      isValid = await form.trigger(['stops']);
    }
    if (isValid) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <>
      <FormStateSubscribe
        control={form.control}
        render={({ isDirty }) => <PreventNavigation shouldBlock={isDirty} />}
      />
      <Form {...form} noHtmlForm>
        <PageLayout>
          <PageLayoutTopBar startActions={<BackButton />}>
            <PageLayoutTopBarTitle>
              {t('commuteTemplate:new.title')}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <Stepper
              steps={steps}
              currentStep={step}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={form.handleSubmit((values) => {
                templateCreate.mutate({
                  ...values,
                  stops: values.stops.map((stop, index) => ({
                    ...stop,
                    order: index,
                  })),
                });
              })}
              onStepClick={setStep}
              isSubmitting={templateCreate.isPending}
              ns="commuteTemplate"
            />
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
