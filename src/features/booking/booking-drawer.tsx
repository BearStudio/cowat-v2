import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';

import { ConfirmSummary } from '@/components/confirm-summary';
import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
} from '@/components/ui/responsive-drawer';

import { type TripType, zTripType } from '@/features/booking/schema';
import {
  type CommuteType,
  type StopEnriched,
  type UserSummary,
} from '@/features/commute/schema';

const zBookingForm = () =>
  z.object({
    tripType: zTripType(),
    comment: z.string().nullish(),
  });

type BookingForm = z.infer<ReturnType<typeof zBookingForm>>;

const useBookingForm = ({
  commuteType,
  isFirstStop,
  isLastStop,
}: {
  commuteType: CommuteType;
  isFirstStop: boolean;
  isLastStop: boolean;
}) => {
  const { t } = useTranslation(['dashboard']);

  const allowOneway = !isLastStop;
  const allowReturn = commuteType === 'ROUND' && !isFirstStop;
  const allowRound = commuteType === 'ROUND' && !isLastStop;

  const tripTypeOptions = [
    ...(allowRound
      ? [
          {
            value: 'ROUND',
            label: t('dashboard:booking.tripTypeOptions.ROUND'),
          },
        ]
      : []),
    ...(allowOneway
      ? [
          {
            value: 'ONEWAY',
            label: t('dashboard:booking.tripTypeOptions.ONEWAY'),
          },
        ]
      : []),
    ...(allowReturn
      ? [
          {
            value: 'RETURN',
            label: t('dashboard:booking.tripTypeOptions.RETURN'),
          },
        ]
      : []),
  ];

  const defaultTripType: TripType =
    (tripTypeOptions[0]?.value as TripType) ?? 'ONEWAY';

  const form = useForm<BookingForm>({
    resolver: zodResolver(zBookingForm()),
    defaultValues: {
      tripType: defaultTripType,
      comment: null,
    },
  });

  useEffect(() => {
    form.reset({ tripType: defaultTripType, comment: null });
  }, [defaultTripType, form]);

  return { form, tripTypeOptions };
};

export const BookingDrawer = (props: {
  stopId: string;
  commuteType: CommuteType;
  commuteDate: Date;
  stop: StopEnriched | null;
  driver: UserSummary | null;
  isFirstStop: boolean;
  isLastStop: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation(['dashboard', 'commute']);
  const { form, tripTypeOptions } = useBookingForm({
    commuteType: props.commuteType,
    isFirstStop: props.isFirstStop,
    isLastStop: props.isLastStop,
  });

  const bookingRequest = useMutation(
    orpc.booking.request.mutationOptions({
      onSuccess: async (data, _variables, _onMutateResult, context) => {
        toast.success(
          t(
            data.status === 'ACCEPTED'
              ? 'dashboard:booking.autoAcceptedMessage'
              : 'dashboard:booking.successMessage'
          )
        );
        await context.client.invalidateQueries({
          queryKey: orpc.commute.getByDate.key(),
          type: 'all',
        });
        form.reset();
        props.onOpenChange(false);
      },
      onError: () => toast.error(t('dashboard:booking.errorMessage')),
    })
  );

  return (
    <ResponsiveDrawer
      open={props.open}
      onOpenChange={(isOpen) => {
        props.onOpenChange(isOpen);
        if (!isOpen) form.reset();
      }}
    >
      <ResponsiveDrawerContent>
        <Form
          {...form}
          onSubmit={async ({ tripType, comment }) => {
            bookingRequest.mutate({
              stopId: props.stopId,
              tripType,
              comment,
            });
          }}
          className="flex flex-col gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>
              {t('dashboard:booking.title')}
            </ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription className="sr-only">
              {t('dashboard:booking.title')}
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody className="flex flex-col gap-4">
            {props.stop && (
              <ConfirmSummary
                user={props.driver ?? undefined}
                date={props.commuteDate}
                typeLabel={t(`commute:list.type.${props.commuteType}`)}
                stops={[props.stop]}
              />
            )}
            {tripTypeOptions.length > 1 && (
              <FormField>
                <FormFieldLabel required>
                  {t('dashboard:booking.tripType')}
                </FormFieldLabel>
                <FormFieldController
                  control={form.control}
                  type="radio-group"
                  name="tripType"
                  options={tripTypeOptions}
                />
              </FormField>
            )}
            <FormField>
              <FormFieldLabel>{t('dashboard:booking.comment')}</FormFieldLabel>
              <FormFieldController
                control={form.control}
                type="text"
                name="comment"
                placeholder={t('dashboard:booking.commentPlaceholder')}
              />
            </FormField>
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={bookingRequest.isPending}
            >
              {t('dashboard:booking.submitButton')}
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
