import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { CalendarIcon, MapPinIcon, MessageSquareIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import '@/lib/dayjs/config';

import { orpc } from '@/lib/orpc/client';

import { CommentText } from '@/components/comment-text';
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

  const relativeDate = dayjs(request.date).fromNow();

  return (
    <Card className="border-l-warning relative overflow-hidden border-l-4">
      <div className="bg-warning pointer-events-none absolute top-1/2 -left-6 size-28 -translate-y-1/2 rounded-full opacity-15 blur-2xl" />

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
            <CardDescription className="flex items-center gap-1 capitalize">
              <CalendarIcon className="size-3 shrink-0" />
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

      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {request.destination && (
            <Badge variant="secondary" size="sm">
              <MapPinIcon className="size-3" />
              {request.destination}
            </Badge>
          )}
          <span className="text-2xs text-muted-foreground">{relativeDate}</span>
        </div>
        {request.comment && <CommentText>{request.comment}</CommentText>}
      </CardContent>

      <CardFooter className="justify-between gap-2 border-t pt-3">
        {!isOwner ? (
          <OrgButtonLink
            className="flex-1"
            size="sm"
            to="/app/$orgSlug/commutes/new"
            search={{ date: request.date, commuteRequestIds: [request.id] }}
            viewTransition={{ types: ['slide-up'] }}
          >
            {t('commuteRequest:actions.offerRide')}
          </OrgButtonLink>
        ) : (
          <Button
            className="flex-1"
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
                  {(request.destination || request.comment) && (
                    <div className="flex flex-col gap-2 border-t pt-2">
                      {request.destination && (
                        <Badge
                          variant="secondary"
                          size="sm"
                          className="self-start"
                        >
                          <MapPinIcon className="size-3" />
                          {request.destination}
                        </Badge>
                      )}
                      {request.comment && (
                        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                          <MessageSquareIcon className="mt-0.5 size-3 shrink-0" />
                          {request.comment}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            }
            confirmText={t('commuteRequest:actions.cancelConfirmButton')}
            confirmVariant="destructive"
            onConfirm={() =>
              updateStatus.mutateAsync({
                id: request.id,
                status: 'CANCELED',
              })
            }
          >
            <Button
              className="flex-1"
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
