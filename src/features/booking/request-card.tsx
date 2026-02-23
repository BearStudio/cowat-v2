import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import '@/lib/dayjs/config';

import { tripTypeIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
      <CardHeader>
        <div className="flex items-start gap-2">
          <Avatar size="xl" className="rounded-sm">
            <AvatarImage
              src={request.passenger.image ?? undefined}
              className="rounded-md"
            />
            <AvatarFallback
              variant="boring"
              name={request.passenger.name ?? '?'}
            />
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <CardTitle className="capitalize">
              {dayjs(request.stop.commute.date).f('booking:requestDateFull')}
            </CardTitle>
            <CardDescription>{request.passenger.name}</CardDescription>
          </div>
        </div>
        <div className="col-span-full flex items-center gap-2">
          <Badge variant="secondary" size="sm">
            {t(`booking:request.tripType.${request.tripType}`)}
          </Badge>
        </div>
        <div className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <tripTypeIcons.ONEWAY className="size-3" />
            {request.stop.outwardTime}
          </span>
          {request.stop.inwardTime && (
            <span className="flex items-center gap-0.5">
              <tripTypeIcons.RETURN className="size-3" />
              {request.stop.inwardTime}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center self-stretch">
              <div className="flex h-6 items-center">
                <div className="size-3 shrink-0 rounded-full bg-primary" />
              </div>
            </div>
            <span className="truncate text-base leading-6 font-medium">
              {request.stop.location.name}
            </span>
          </div>
          {request.comment && (
            <p className="text-sm text-muted-foreground">{request.comment}</p>
          )}
        </div>
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
              <BookingRequestSummary request={request} />
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
