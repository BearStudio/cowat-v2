import { Collapsible } from '@base-ui/react/collapsible';
import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronDown, PlusIcon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { match } from 'ts-pattern';

import { orpc } from '@/lib/orpc/client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
import {
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
} from '@/components/ui/datalist';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { ResponsiveIconButtonLink } from '@/components/ui/responsive-icon-button-link';

import { authClient } from '@/features/auth/client';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageCommutes = () => {
  const { t } = useTranslation(['commute', 'common']);
  const session = authClient.useSession();

  const commutesQuery = useInfiniteQuery(
    orpc.commute.getMyCommutes.infiniteOptions({
      input: (cursor: string | undefined) => ({
        cursor,
      }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const commuteCancel = useMutation(
    orpc.commute.cancel.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('commute:list.cancelSuccessMessage'));
        await context.client.invalidateQueries({
          queryKey: orpc.commute.getMyCommutes.key(),
          type: 'all',
        });
      },
    })
  );

  const ui = getUiState((set) => {
    if (commutesQuery.status === 'pending') return set('pending');
    if (commutesQuery.status === 'error') return set('error');
    const items = commutesQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length) return set('empty');
    return set('default', { items });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        endActions={
          <ResponsiveIconButtonLink
            label={t('commute:list.newAction')}
            variant="secondary"
            size="sm"
            to="/app/commutes/new"
          >
            <PlusIcon />
          </ResponsiveIconButtonLink>
        }
      >
        <PageLayoutTopBarTitle>{t('commute:list.title')}</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <DataListLoadingState />)
          .match('error', () => (
            <DataListErrorState retry={() => commutesQuery.refetch()} />
          ))
          .match('empty', () => <DataListEmptyState />)
          .match('default', ({ items }) => (
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const acceptedPassengers = new Map<
                  string,
                  { id: string; name?: string | null; image?: string | null }
                >();
                for (const stop of item.stops) {
                  for (const sp of stop.passengers) {
                    if (
                      sp.status === 'ACCEPTED' &&
                      !acceptedPassengers.has(sp.passenger.id)
                    ) {
                      acceptedPassengers.set(sp.passenger.id, sp.passenger);
                    }
                  }
                }
                const available = item.seats - acceptedPassengers.size;
                const isDriver = session.data?.user.id === item.driverId;

                return (
                  <Collapsible.Root key={item.id}>
                    <Card>
                      <Collapsible.Trigger
                        render={<CardHeader />}
                        className="cursor-pointer [&[data-panel-open]_.chevron-icon]:rotate-180"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            <AvatarImage src={item.driver.image ?? undefined} />
                            <AvatarFallback
                              variant="boring"
                              name={item.driver.name ?? '?'}
                            />
                          </Avatar>
                          <CardTitle>
                            {dayjs(item.date).format('DD/MM/YYYY')}
                          </CardTitle>
                          <Badge
                            variant={match(item.status)
                              .returnType<
                                'positive' | 'warning' | 'secondary'
                              >()
                              .with('ON_TIME', () => 'positive')
                              .with('DELAYED', () => 'warning')
                              .otherwise(() => 'secondary')}
                            size="sm"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {item.driver.name}
                          {' · '}
                          {t(`commute:list.type.${item.type}`)}
                          {' · '}
                          {t('commute:list.availableSeats', {
                            available,
                            total: item.seats,
                          })}
                        </CardDescription>
                        <CardAction>
                          <div className="flex items-center gap-1">
                            {isDriver && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <ConfirmResponsiveDrawer
                                  description={t(
                                    'commute:list.cancelConfirmDescription'
                                  )}
                                  confirmText={t('common:actions.delete')}
                                  confirmVariant="destructive"
                                  onConfirm={() =>
                                    commuteCancel.mutateAsync({ id: item.id })
                                  }
                                >
                                  <ResponsiveIconButton
                                    variant="ghost"
                                    size="sm"
                                    label={t('common:actions.delete')}
                                  >
                                    <Trash2 />
                                  </ResponsiveIconButton>
                                </ConfirmResponsiveDrawer>
                              </div>
                            )}
                            <ChevronDown className="chevron-icon size-4 text-muted-foreground transition-transform" />
                          </div>
                        </CardAction>
                      </Collapsible.Trigger>
                      <Collapsible.Panel className="overflow-hidden transition-all data-[ending-style]:h-0 data-[starting-style]:h-0">
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            {item.comment && (
                              <p className="text-sm text-muted-foreground">
                                {item.comment}
                              </p>
                            )}
                            {item.stops.length > 0 && (
                              <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium">
                                  {t('commute:list.stopsLabel')}
                                </p>
                                {item.stops.map((stop, index) => (
                                  <div
                                    key={stop.id}
                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                  >
                                    <span className="font-medium">
                                      {index + 1}.
                                    </span>
                                    <span>{stop.location.name}</span>
                                    <span>·</span>
                                    <span>{stop.outwardTime}</span>
                                    {stop.inwardTime && (
                                      <>
                                        <span>·</span>
                                        <span>{stop.inwardTime}</span>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {acceptedPassengers.size > 0 && (
                              <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium">
                                  {t('commute:list.passengersLabel')}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {[...acceptedPassengers.values()].map(
                                    (passenger) => (
                                      <div
                                        key={passenger.id}
                                        className="flex items-center gap-1.5 text-sm text-muted-foreground"
                                      >
                                        <Avatar size="sm">
                                          <AvatarImage
                                            src={passenger.image ?? undefined}
                                          />
                                          <AvatarFallback
                                            variant="boring"
                                            name={passenger.name ?? '?'}
                                          />
                                        </Avatar>
                                        <span>{passenger.name}</span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Collapsible.Panel>
                    </Card>
                  </Collapsible.Root>
                );
              })}
              {commutesQuery.hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => commutesQuery.fetchNextPage()}
                    loading={commutesQuery.isFetchingNextPage}
                  >
                    {t('commute:list.loadMore')}
                  </Button>
                </div>
              )}
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
