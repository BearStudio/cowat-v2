import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
        await context.client.invalidateQueries({
          queryKey: orpc.booking.getRequestsForDriver.key(),
          type: 'all',
        });
      },
    })
  );

  const refuse = useMutation(
    orpc.booking.refuse.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('booking:request.refuseSuccess'));
        await context.client.invalidateQueries({
          queryKey: orpc.booking.getRequestsForDriver.key(),
          type: 'all',
        });
      },
    })
  );

  const isMutating = accept.isPending || refuse.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarImage src={request.passenger.image ?? undefined} />
            <AvatarFallback
              variant="boring"
              name={request.passenger.name ?? '?'}
            />
          </Avatar>
          <CardTitle>{request.passenger.name}</CardTitle>
        </div>
        <CardDescription>
          {dayjs(request.stop.commute.date).format('DD/MM/YYYY')}
          {' · '}
          {request.stop.outwardTime}
          {request.stop.inwardTime && ` – ${request.stop.inwardTime}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" size="sm" className="self-start">
            {t(`booking:request.tripType.${request.tripType}`)}
          </Badge>
          {request.comment && (
            <p className="text-sm text-muted-foreground">{request.comment}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <ConfirmResponsiveDrawer
          description={t('booking:request.refuseConfirmDescription')}
          confirmText={t('booking:request.refuseButton')}
          confirmVariant="destructive"
          onConfirm={() => refuse.mutateAsync({ id: request.id })}
        >
          <Button variant="destructive" size="sm" disabled={isMutating}>
            {t('booking:request.refuseButton')}
          </Button>
        </ConfirmResponsiveDrawer>
        <Button
          size="sm"
          loading={accept.isPending}
          disabled={isMutating}
          onClick={() => accept.mutate({ id: request.id })}
        >
          {t('booking:request.acceptButton')}
        </Button>
      </CardFooter>
    </Card>
  );
};
