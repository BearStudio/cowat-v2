import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { FieldPath, FormStateSubscribe, useForm, Watch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { featureIcons } from '@/lib/feature-icons';
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
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

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
import { OrgButtonLink } from '@/features/organization/org-button-link';
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

export const PageCommuteNew = ({
  search,
  orgSlug,
}: {
  search: { date?: Date; commuteRequestIds?: string[] };
  orgSlug: string;
}) => {
  const { t } = useTranslation(['commute']);
  const { navigateBack } = useNavigateBack();
  const [selectedTemplateName, setSelectedTemplateName] = useState<
    string | null
  >(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [submittedValues, setSubmittedValues] =
    useState<FormFieldsCommute | null>(null);

  useShouldShowNav('desktop-only');

  const form = useForm<FormFieldsCommute>({
    resolver: zodResolver(zFormFieldsCommute()),
    defaultValues: { ...DEFAULT_VALUES, date: search.date },
  });

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
        render={({ isDirty }) => (
          <PreventNavigation shouldBlock={isDirty && !saveTemplateOpen} />
        )}
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
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Drawer
                      swipeDirection="up"
                      open={templatePickerOpen}
                      onOpenChange={setTemplatePickerOpen}
                    >
                      <DrawerTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="xs"
                            className="flex-1 text-muted-foreground"
                          />
                        }
                      >
                        <featureIcons.CommuteTemplates className="size-3.5" />
                        {t('commute:templatePicker.useTemplate')}
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>
                            {t('commute:templatePicker.title')}
                          </DrawerTitle>
                        </DrawerHeader>
                        <DrawerBody className="flex-col gap-3 pb-6">
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
                    <OrgButtonLink
                      variant="ghost"
                      size="xs"
                      className="flex-1 text-muted-foreground"
                      to="/app/$orgSlug/requests/commute"
                      search={{ date: search.date }}
                    >
                      <featureIcons.CommuteRequest className="size-3.5" />
                      {t('commute:new.requestButton')}
                    </OrgButtonLink>
                  </div>
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

      <SaveTemplateDrawer
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        commuteValues={submittedValues}
        onDone={goBack}
      />
    </>
  );
};
