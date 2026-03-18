import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { PenLineIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FieldPath, FormStateSubscribe, useForm, Watch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from 'react-use-disclosure';
import { toast } from 'sonner';

import { toNoonUTC } from '@/lib/dayjs/to-noon-utc';
import { featureIcons } from '@/lib/feature-icons';
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
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerClose,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
} from '@/components/ui/responsive-drawer';

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
  search: { date?: Date };
  orgSlug: string;
}) => {
  const { t } = useTranslation(['commute', 'common']);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const [showForm, setShowForm] = useState(false);
  const requestDrawer = useDisclosure();
  const [requestDate, setRequestDate] = useState<Date | undefined>(search.date);
  const [requestDestination, setRequestDestination] = useState('');

  useShouldShowNav(showForm ? 'desktop-only' : 'all');

  const form = useForm<FormFieldsCommute>({
    resolver: zodResolver(zFormFieldsCommute()),
    defaultValues: { ...DEFAULT_VALUES, date: search.date },
  });

  // Intercept browser back button when form is open
  useEffect(() => {
    if (!showForm) return;

    const handlePopState = () => {
      setShowForm(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showForm]);

  const openForm = () => {
    router.history.push(router.state.location.href);
    setShowForm(true);
  };

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
            params: { orgSlug },
            replace: true,
            ignoreBlocker: true,
          });
        }
      },
    })
  );

  const commuteRequest = useMutation(
    orpc.commute.requestCommute.mutationOptions({
      onSuccess: () => {
        toast.success(t('commute:new.requestDrawer.success'));
        requestDrawer.close();

        if (canGoBack) {
          router.history.back();
        } else {
          router.navigate({
            to: '/app/$orgSlug/commutes',
            params: { orgSlug },
            replace: true,
          });
        }
      },
    })
  );

  const today = dayjs().startOf('day').toDate();

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
          <Button
            variant="secondary"
            className="w-full"
            onClick={requestDrawer.open}
          >
            <featureIcons.CommuteRequest />
            {t('commute:new.requestButton')}
          </Button>
          <ResponsiveDrawer
            open={requestDrawer.isOpen}
            onOpenChange={(open) => {
              if (!open) requestDrawer.close();
            }}
          >
            <ResponsiveDrawerContent>
              <ResponsiveDrawerHeader className="text-center">
                <ResponsiveDrawerTitle>
                  {t('commute:new.requestDrawer.title')}
                </ResponsiveDrawerTitle>
                <ResponsiveDrawerDescription>
                  {t('commute:new.requestDrawer.description')}
                </ResponsiveDrawerDescription>
              </ResponsiveDrawerHeader>
              <ResponsiveDrawerBody className="flex flex-col gap-4">
                <Calendar
                  className="mx-auto"
                  mode="single"
                  selected={requestDate}
                  onSelect={(date) => {
                    if (date) setRequestDate(toNoonUTC(date));
                  }}
                  defaultMonth={requestDate}
                  disabled={(date) => date < today}
                  startMonth={today}
                />
                <div className="flex flex-col gap-1.5 px-1">
                  <Label>{t('commute:new.requestDrawer.destination')}</Label>
                  <Input
                    placeholder={t(
                      'commute:new.requestDrawer.destinationPlaceholder'
                    )}
                    value={requestDestination}
                    onChange={(e) => setRequestDestination(e.target.value)}
                  />
                </div>
              </ResponsiveDrawerBody>
              <ResponsiveDrawerFooter>
                <ResponsiveDrawerClose
                  render={
                    <Button variant="secondary" className="max-sm:w-full" />
                  }
                >
                  {t('common:actions.cancel')}
                </ResponsiveDrawerClose>
                <Button
                  className="max-sm:w-full"
                  disabled={!requestDate}
                  loading={commuteRequest.isPending}
                  onClick={() => {
                    if (requestDate) {
                      commuteRequest.mutate({
                        date: requestDate,
                        destination: requestDestination || undefined,
                      });
                    }
                  }}
                >
                  {t('commute:new.requestDrawer.submit')}
                </Button>
              </ResponsiveDrawerFooter>
            </ResponsiveDrawerContent>
          </ResponsiveDrawer>
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
            <PageLayoutTopBar
              startActions={
                <BackButton
                  onClick={(event) => {
                    event.preventDefault();
                    router.history.back();
                  }}
                />
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
                onNext={() => form.trigger(['date', 'seats', 'type'])}
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
