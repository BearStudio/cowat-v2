import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import '@/lib/dayjs/config';

import { orpc } from '@/lib/orpc/client';

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

import type { CommuteRequestForList } from '@/features/commute-request/schema';
import { OrgButtonLink } from '@/features/organization/org-button-link';

type CommuteRequestCardProps = {
  request: CommuteRequestForList;
  isOwner: boolean;
};

export const CommuteRequestCard = ({
  request,
  isOwner,
}: CommuteRequestCardProps) => {
  const { t } = useTranslation(['commuteRequest', 'common']);

  const updateStatus = useMutation(
    orpc.commuteRequest.updateStatus.mutationOptions({
      onSuccess: async (_data, variables, _onMutateResult, context) => {
        toast.success(
          t(
            variables.status === 'CANCELED'
              ? 'commuteRequest:actions.cancelSuccess'
              : 'commuteRequest:actions.fulfillSuccess'
          )
        );
        await context.client.invalidateQueries({
          queryKey: orpc.commuteRequest.getAll.key(),
          type: 'all',
        });
      },
    })
  );

  return (
    <Card className="border-l-warning relative overflow-hidden border-l-4">
      <div className="bg-warning pointer-events-none absolute top-1/2 -left-6 size-28 -translate-y-1/2 rounded-full opacity-30 blur-2xl" />

      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar size="xl" className="rounded-sm">
            <AvatarImage
              src={request.requester.image ?? undefined}
              className="rounded-md"
            />
            <AvatarFallback
              variant="boring"
              name={request.requester.name ?? '?'}
            />
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <CardTitle className="truncate">{request.requester.name}</CardTitle>
            <CardDescription className="capitalize">
              {dayjs(request.date).f('booking:requestDateFull')}
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <Badge variant="warning" size="sm">
            {t(`commuteRequest:status.${request.status}`)}
          </Badge>
        </CardAction>
      </CardHeader>

      {request.destination && (
        <CardContent>
          <Badge variant="secondary" size="sm">
            <MapPinIcon className="size-3" />
            {request.destination}
          </Badge>
        </CardContent>
      )}

      <CardFooter className="justify-between gap-2 border-t pt-3">
        {!isOwner ? (
          <OrgButtonLink
            size="sm"
            to="/app/$orgSlug/commutes/new"
            search={{ date: request.date, commuteRequestId: request.id }}
          >
            {t('commuteRequest:actions.offerRide')}
          </OrgButtonLink>
        ) : (
          <Button
            size="sm"
            loading={updateStatus.isPending}
            disabled={updateStatus.isPending}
            onClick={() =>
              updateStatus.mutate({ id: request.id, status: 'FULFILLED' })
            }
          >
            {t('commuteRequest:actions.fulfillButton')}
          </Button>
        )}
        {isOwner && (
          <ConfirmResponsiveDrawer
            description={
              <div className="flex flex-col gap-3">
                <span>
                  {t('commuteRequest:actions.cancelConfirmDescription')}
                </span>
                <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3 text-left text-sm">
                  <div className="flex items-center gap-3">
                    <Avatar size="xl" className="rounded-sm">
                      <AvatarImage
                        src={request.requester.image ?? undefined}
                        className="rounded-md"
                      />
                      <AvatarFallback
                        variant="boring"
                        name={request.requester.name ?? '?'}
                      />
                    </Avatar>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-medium">
                        {request.requester.name}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground capitalize">
                        <CalendarIcon className="size-3" />
                        {dayjs(request.date).f('booking:requestDateFull')}
                      </span>
                    </div>
                  </div>
                  {request.destination && (
                    <div className="border-t pt-2">
                      <Badge variant="secondary" size="sm">
                        <MapPinIcon className="size-3" />
                        {request.destination}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            }
            confirmText={t('commuteRequest:actions.cancelButton')}
            confirmVariant="destructive"
            onConfirm={() =>
              updateStatus.mutateAsync({
                id: request.id,
                status: 'CANCELED',
              })
            }
          >
            <Button
              variant="destructive-secondary"
              size="sm"
              disabled={updateStatus.isPending}
            >
              {t('commuteRequest:actions.cancelButton')}
            </Button>
          </ConfirmResponsiveDrawer>
        )}
      </CardFooter>
    </Card>
  );
};
