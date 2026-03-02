import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';
import { toast } from '@/lib/toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';

import { BookingRequestSummary } from '@/features/booking/booking-request-summary';
import { BookingForDriver } from '@/features/booking/schema';

type RequestCardProps = {
  request: BookingForDriver;
};

export const RequestCard = ({ request }: RequestCardProps) => {
  const { t } = useTranslation(['booking', 'common']);

  const accept = useMutation(
    orpc.booking.accept.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('booking:request.acceptSuccess'));
        await Promise.all([
          context.client.invalidateQueries({
            queryKey: orpc.booking.getRequestsForDriver.key(),
            type: 'all',
          }),
          context.client.invalidateQueries({
            queryKey: orpc.booking.pendingRequestCount.key(),
            type: 'all',
          }),
        ]);
      },
    })
  );

  const refuse = useMutation(
    orpc.booking.refuse.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('booking:request.refuseSuccess'));
        await Promise.all([
          context.client.invalidateQueries({
            queryKey: orpc.booking.getRequestsForDriver.key(),
            type: 'all',
          }),
          context.client.invalidateQueries({
            queryKey: orpc.booking.pendingRequestCount.key(),
            type: 'all',
          }),
        ]);
      },
    })
  );

  const isMutating = accept.isPending || refuse.isPending;

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <BookingRequestSummary request={request} avatarSize="lg" />
        {request.comment && (
          <p className="text-sm text-muted-foreground">{request.comment}</p>
        )}
      </CardContent>
      <CardFooter className="w-full justify-between gap-2">
        <Button
          size="sm"
          loading={accept.isPending}
          disabled={isMutating}
          onClick={() => accept.mutate({ id: request.id })}
        >
          {t('booking:request.acceptButton')}
        </Button>
        <ConfirmResponsiveDrawer
          description={
            <div className="flex flex-col gap-3">
              <span>{t('booking:request.refuseConfirmDescription')}</span>
              <div className="rounded-md border bg-muted/40 p-3">
                <BookingRequestSummary request={request} />
              </div>
            </div>
          }
          confirmText={t('booking:request.refuseButton')}
          confirmVariant="destructive"
          onConfirm={() => refuse.mutateAsync({ id: request.id })}
        >
          <Button
            variant="destructive-secondary"
            size="sm"
            disabled={isMutating}
          >
            {t('booking:request.refuseButton')}
          </Button>
        </ConfirmResponsiveDrawer>
      </CardFooter>
    </Card>
  );
};
