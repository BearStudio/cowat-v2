import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';

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

import { zTripType } from '@/features/booking/schema';

const zBookingForm = () =>
  z.object({
    tripType: zTripType(),
    comment: z.string().nullish(),
  });

type BookingForm = z.infer<ReturnType<typeof zBookingForm>>;

export const BookingDrawer = (props: {
  stopId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation(['dashboard']);

  const form = useForm<BookingForm>({
    resolver: zodResolver(zBookingForm()),
    defaultValues: {
      tripType: 'ROUND',
      comment: null,
    },
  });

  const bookingRequest = useMutation(
    orpc.booking.request.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('dashboard:booking.successMessage'));
        await context.client.invalidateQueries({
          queryKey: orpc.commute.getByDate.key(),
          type: 'all',
        });
        form.reset();
        props.onOpenChange(false);
      },
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
      <ResponsiveDrawerContent className="sm:max-w-xs">
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
            <FormField>
              <FormFieldLabel>{t('dashboard:booking.tripType')}</FormFieldLabel>
              <FormFieldController
                control={form.control}
                type="radio-group"
                name="tripType"
                options={[
                  {
                    value: 'ROUND',
                    label: t('dashboard:booking.tripTypeOptions.ROUND'),
                  },
                  {
                    value: 'ONEWAY',
                    label: t('dashboard:booking.tripTypeOptions.ONEWAY'),
                  },
                  {
                    value: 'RETURN',
                    label: t('dashboard:booking.tripTypeOptions.RETURN'),
                  },
                ]}
              />
            </FormField>
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
