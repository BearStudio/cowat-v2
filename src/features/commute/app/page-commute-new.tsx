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

import { toNoonUTC } from '@/lib/dayjs/to-noon-utc';
import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigateBack } from '@/hooks/use-navigate-back';

import { BackButton } from '@/components/back-button';
import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
  MultiStepForm,
  MultiStepFormContent,
  MultiStepFormNavigation,
  MultiStepFormStep,
} from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';

import { TemplatePicker } from '@/features/commute/app/template-picker';
import { StepDetailsCommute } from '@/features/commute/form-commute/step-details-commute';
import { StepInwardStops } from '@/features/commute/form-commute/step-inward-stops';
import { StepOutwardStops } from '@/features/commute/form-commute/step-outward-stops';
import { StepRecap } from '@/features/commute/form-commute/step-recap';
import {
  asCommuteBase,
  FormFieldsCommute,
  FormFieldsCommuteRequest,
  zFormFieldsCommute,
  zFormFieldsCommuteRequest,
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

const SaveTemplateDrawer = ({
  open,
  onOpenChange,
  commuteValues,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commuteValues: FormFieldsCommute | null;
  onDone: () => void;
}) => {
  const { t } = useTranslation(['commute', 'commuteTemplate']);
  const [templateName, setTemplateName] = useState('');

  const templateCreate = useMutation(
    orpc.commuteTemplate.create.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('commute:new.templateSaved'));
        await context.client.invalidateQueries({
          queryKey: orpc.commuteTemplate.getAll.key(),
          type: 'all',
        });
        onDone();
      },
    })
  );

  const handleSave = () => {
    if (!commuteValues || !templateName.trim()) return;
    templateCreate.mutate({
      name: templateName.trim(),
      seats: commuteValues.seats,
      type: commuteValues.type,
      comment: commuteValues.comment,
      stops: commuteValues.stops.map((stop, index) => ({
        ...stop,
        order: index,
      })),
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="down">
      <DrawerContent initialFocus={false}>
        <DrawerHeader>
          <DrawerTitle>{t('commute:new.saveTemplateTitle')}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            {t('commute:new.saveTemplateDescription')}
          </p>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder={t('commuteTemplate:form.namePlaceholder')}
          />
        </DrawerBody>
        <DrawerFooter>
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={!templateName.trim()}
            loading={templateCreate.isPending}
          >
            {t('commute:new.saveTemplateConfirm')}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onDone}>
            {t('commute:new.saveTemplateSkip')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const RequestCommuteDrawer = ({
  open,
  onOpenChange,
  initialDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
}) => {
  const { t } = useTranslation(['commute']);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const form = useForm<FormFieldsCommuteRequest>({
    resolver: zodResolver(zFormFieldsCommuteRequest()),
    mode: 'all',
    defaultValues: { date: initialDate, destination: null, comment: null },
  });

  useEffect(() => {
    if (open) {
      form.reset({ date: initialDate, destination: null, comment: null });
    }
  }, [open, form, initialDate]);

  const commuteRequest = useMutation(
    orpc.commuteRequest.create.mutationOptions({
      onSuccess: () => {
        toast.success(t('commute:new.requestDrawer.success'));
        onOpenChange(false);
      },
    })
  );

  const handleSubmit = form.handleSubmit(({ date, destination, comment }) => {
    commuteRequest.mutate({
      date: toNoonUTC(date),
      destination: destination ?? undefined,
      comment: comment ?? undefined,
    });
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="down">
      <DrawerContent>
        <Form {...form} noHtmlForm>
          <DrawerHeader>
            <DrawerTitle>{t('commute:new.requestDrawer.title')}</DrawerTitle>
            <DrawerDescription>
              {t('commute:new.requestDrawer.description')}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="flex-col gap-4 pt-2 pb-4">
            <FormField>
              <FormFieldLabel required>{t('commute:form.date')}</FormFieldLabel>
              <FormFieldController
                type="date"
                control={form.control}
                name="date"
                calendarProps={{
                  disabled: (d) => d < today,
                  startMonth: today,
                }}
              />
            </FormField>
            <FormField>
              <FormFieldLabel>
                {t('commute:new.requestDrawer.destination')}
              </FormFieldLabel>
              <FormFieldController
                type="text"
                control={form.control}
                name="destination"
                placeholder={t(
                  'commute:new.requestDrawer.destinationPlaceholder'
                )}
              />
            </FormField>
            <FormField>
              <FormFieldLabel>
                {t('commute:new.requestDrawer.comment')}
              </FormFieldLabel>
              <FormFieldController
                type="textarea"
                control={form.control}
                name="comment"
                placeholder={t('commute:new.requestDrawer.commentPlaceholder')}
                rows={3}
              />
            </FormField>
          </DrawerBody>
          <DrawerFooter>
            <Button
              className="w-full"
              disabled={!form.formState.isValid}
              loading={commuteRequest.isPending}
              onClick={handleSubmit}
            >
              {t('commute:new.requestDrawer.submit')}
            </Button>
          </DrawerFooter>
        </Form>
      </DrawerContent>
    </Drawer>
  );
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
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    onDateChange?.(currentDate ?? undefined);
  }, [currentDate, onDateChange]);

  const goBack = () => {
    navigateBack({
      ignoreBlocker: true,
      to: '/app/$orgSlug/commutes',
      params: { orgSlug },
    });
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
              startActions={<BackButton />}
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
                <div className="flex flex-col gap-6">
                  {selectedTemplateName && (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <featureIcons.CommuteTemplates className="size-4 shrink-0" />
                      {t('commute:templatePicker.usingTemplate', {
                        name: selectedTemplateName,
                      })}
                    </p>
                  )}
                  <StepDetailsCommute />
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
            />
          </PageLayout>
        </MultiStepForm>
      </Form>

      <Drawer
        swipeDirection="up"
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('commute:templatePicker.title')}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="gap-3 overflow-hidden pb-6">
            <TemplatePicker
              onSelect={({ templateName, ...data }) => {
                setSelectedTemplateName(templateName);
                form.reset({
                  ...DEFAULT_VALUES,
                  date: search.date,
                  ...data,
                });
                setTemplatePickerOpen(false);
              }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <SaveTemplateDrawer
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
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
