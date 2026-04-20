import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  FieldPath,
  FormStateSubscribe,
  useForm,
  useWatch,
  Watch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
} from '@/components/ui/responsive-drawer';

import { SaveTemplateDrawer } from '@/features/commute/app/save-template-drawer';
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
import { RequestCommuteDrawer } from '@/features/commute-request/request-commute-drawer';
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
  onDateChange,
}: {
  search: { date?: Date; commuteRequestIds?: string[] };
  orgSlug: string;
  onDateChange?: (date: Date | undefined) => void;
}) => {
  const { t } = useTranslation(['commute']);
  const { navigateBack } = useNavigateBack();
  const [selectedTemplateName, setSelectedTemplateName] = useState<
    string | null
  >(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [requestCommuteOpen, setRequestCommuteOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [submittedValues, setSubmittedValues] =
    useState<FormFieldsCommute | null>(null);

  useShouldShowNav('desktop-only');
  const isMobile = useIsMobile();

  const form = useForm<FormFieldsCommute>({
    resolver: zodResolver(zFormFieldsCommute()),
    defaultValues: { ...DEFAULT_VALUES, date: search.date },
  });

  const currentDate = useWatch({ control: form.control, name: 'date' });
  const onDateChangeRef = useRef(onDateChange);
  onDateChangeRef.current = onDateChange;
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    onDateChangeRef.current?.(currentDate ?? undefined);
  }, [currentDate]);

  const goBack = () => {
    const navigate = () =>
      navigateBack({
        ignoreBlocker: true,
        to: '/app/$orgSlug/commutes',
        params: { orgSlug },
      });

    if (document.startViewTransition) {
      document.startViewTransition({
        update: navigate,
        types: ['slide-down'],
      });
    } else {
      navigate();
    }
  };

  const commuteCreate = useMutation(
    orpc.commute.create.mutationOptions({
      onSuccess: (_data, variables) => {
        if (selectedTemplateName) {
          goBack();
        } else {
          setSubmittedValues({
            seats: variables.seats,
            type: variables.type,
            comment: variables.comment ?? null,
            date: variables.date,
            stops: variables.stops.map((s) => ({
              locationId: s.locationId,
              outwardTime: s.outwardTime,
              inwardTime: s.inwardTime ?? null,
            })),
          });
          setSaveTemplateOpen(true);
        }
      },
    })
  );

  const handleSelectTemplate = ({
    templateName,
    ...data
  }: { templateName: string } & Pick<
    FormFieldsCommute,
    'seats' | 'type' | 'comment' | 'stops'
  >) => {
    setSelectedTemplateName(templateName);
    form.reset({
      ...DEFAULT_VALUES,
      date: search.date,
      ...data,
    });
    toast.success(t('commute:templatePicker.templateApplied'));
  };

  const handleSubmit = form.handleSubmit((values) => {
    commuteCreate.mutate({
      ...values,
      stops: values.stops.map((stop, index) => ({ ...stop, order: index })),
      commuteRequestIds: search.commuteRequestIds,
    });
  });

  return (
    <>
      <FormStateSubscribe
        control={form.control}
        render={({ dirtyFields }) => {
          const { date: _date, ...otherDirtyFields } = dirtyFields;
          const isFormDirty = Object.keys(otherDirtyFields).length > 0;
          return (
            <PreventNavigation shouldBlock={isFormDirty && !saveTemplateOpen} />
          );
        }}
      />
      <Form {...form} noHtmlForm>
        <MultiStepForm>
          <PageLayout>
            <PageLayoutTopBar
              className="[view-transition-name:none]"
              startActions={
                <BackButton viewTransition={{ types: ['slide-down'] }} />
              }
              endActions={
                <>
                  <Button
                    variant="ghost"
                    size={isMobile ? 'icon-lg' : 'xs'}
                    onClick={() => setTemplatePickerOpen(true)}
                  >
                    <featureIcons.CommuteTemplates
                      className={isMobile ? 'size-5' : 'size-3.5'}
                    />
                    {!isMobile && t('commute:templatePicker.useTemplate')}
                  </Button>
                  <Button
                    variant="ghost"
                    size={isMobile ? 'icon-lg' : 'xs'}
                    onClick={() => setRequestCommuteOpen(true)}
                  >
                    <featureIcons.CommuteRequest
                      className={isMobile ? 'size-5' : 'size-3.5'}
                    />
                    {!isMobile && t('commute:new.requestButton')}
                  </Button>
                </>
              }
            >
              <PageLayoutTopBarTitle>
                {t('commute:new.title')}
              </PageLayoutTopBarTitle>
            </PageLayoutTopBar>
            <PageLayoutContent>
              <MultiStepFormContent />
              <MultiStepFormStep
                name={t('commute:stepper.details')}
                onNext={() => {
                  return form.trigger(['date', 'seats', 'type']);
                }}
              >
                <StepDetailsCommute />
                <div className="-mx-4 mt-4 flex flex-col gap-2">
                  <p className="px-4 text-sm font-medium text-muted-foreground">
                    {t('commute:templatePicker.selectTemplate')}
                  </p>
                  <TemplatePicker onSelect={handleSelectTemplate} compact />
                </div>
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
              banner={
                selectedTemplateName ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={commuteCreate.isPending}
                    className="mx-auto w-full max-w-4xl px-4"
                  >
                    <Alert
                      variant="primary"
                      className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-3 transition-opacity hover:opacity-80"
                    >
                      <featureIcons.CommuteTemplates className="size-4" />
                      <AlertTitle className="col-start-2 text-left">
                        {t('commute:templatePicker.quickCreate', {
                          name: selectedTemplateName,
                        })}
                      </AlertTitle>
                      <span className="col-start-3 row-start-1 text-sm font-medium text-primary">
                        {commuteCreate.isPending
                          ? '...'
                          : t('commute:stepper.submit')}
                      </span>
                    </Alert>
                  </button>
                ) : null
              }
            />
          </PageLayout>
        </MultiStepForm>
      </Form>

      <ResponsiveDrawer
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
      >
        <ResponsiveDrawerContent>
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>
              {t('commute:templatePicker.title')}
            </ResponsiveDrawerTitle>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody className="gap-3 overflow-hidden pb-6">
            <TemplatePicker
              onSelect={(data) => {
                handleSelectTemplate(data);
                setTemplatePickerOpen(false);
              }}
            />
          </ResponsiveDrawerBody>
        </ResponsiveDrawerContent>
      </ResponsiveDrawer>

      <SaveTemplateDrawer
        open={saveTemplateOpen}
        onOpenChange={(open) => {
          setSaveTemplateOpen(open);
          if (!open) goBack();
        }}
        commuteValues={submittedValues}
        onDone={goBack}
      />
      <RequestCommuteDrawer
        open={requestCommuteOpen}
        onOpenChange={setRequestCommuteOpen}
        initialDate={search.date}
      />
    </>
  );
};
