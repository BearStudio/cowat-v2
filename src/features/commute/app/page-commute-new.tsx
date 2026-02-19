import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { PenLineIcon } from 'lucide-react';
import { useState } from 'react';
import { FormStateSubscribe, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from 'react-use-disclosure';
import { toast } from 'sonner';

import { toNoonUTC } from '@/lib/dayjs/to-noon-utc';
import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
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
