import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import '@/lib/dayjs/config';

import { orpc } from '@/lib/orpc/client';

import { CommentText } from '@/components/comment-text';
import { ConfirmSummary } from '@/components/confirm-summary';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';

import { BookingForDriver } from '@/features/booking/schema';
import { StopsTimelineItem } from '@/features/commute/stops-timeline';

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
    <Card className="relative overflow-hidden border-l-4 border-l-primary">
      <div className="pointer-events-none absolute top-1/2 -left-6 size-28 -translate-y-1/2 rounded-full bg-primary opacity-15 blur-2xl" />

      <CardHeader>
        <div className="flex items-center gap-3">
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
          <div className="flex min-w-0 flex-col gap-0.5">
            <CardTitle className="truncate">{request.passenger.name}</CardTitle>
            <CardDescription className="capitalize">
              {dayjs(request.stop.commute.date).f('booking:requestDateFull')}
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <Badge variant="secondary" size="sm">
            {t(`booking:request.tripType.${request.tripType}`)}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <StopsTimelineItem stop={request.stop} isFirst isLast />
        {request.comment && <CommentText>{request.comment}</CommentText>}
      </CardContent>

      <CardFooter className="justify-between gap-2 border-t pt-3">
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
              <ConfirmSummary
                user={request.passenger}
                date={request.stop.commute.date}
                dateFormat="booking:requestDateFull"
                typeLabel={t(`booking:request.tripType.${request.tripType}`)}
                stops={[request.stop]}
              />
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
