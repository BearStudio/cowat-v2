import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
  DataListTextHeader,
} from '@/components/ui/datalist';
import { DatePicker } from '@/components/ui/date-picker';

import { RankingCard } from '@/features/stats/manager/ranking-card';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageStats = () => {
  const { t } = useTranslation(['stats']);

  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  const statsQuery = useQuery(
    orpc.stats.getAll.queryOptions({
      input:
        from || to
          ? { from: from ?? undefined, to: to ?? undefined }
          : undefined,
    })
  );

  const ui = getUiState((set) => {
    if (statsQuery.status === 'pending') return set('pending');
    if (statsQuery.status === 'error') return set('error');
    const users = statsQuery.data?.users ?? [];
    if (!users.length) return set('empty');
    return set('default', { users });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>
          {t('stats:manager.title')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <div className="flex flex-wrap items-center gap-3 px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">
            {t('stats:manager.filters.from')}
          </span>
          <DatePicker value={from} onChange={setFrom} noCalendar={false} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">
            {t('stats:manager.filters.to')}
          </span>
          <DatePicker value={to} onChange={setTo} noCalendar={false} />
        </div>
        {(from || to) && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setFrom(null);
              setTo(null);
            }}
          >
            {t('stats:manager.filters.reset')}
          </Button>
        )}
      </div>
      <PageLayoutContent className="pb-20">
        {ui
          .match('pending', () => (
            <DataList>
              <DataListLoadingState />
            </DataList>
          ))
          .match('error', () => (
            <DataList>
              <DataListErrorState retry={() => statsQuery.refetch()} />
            </DataList>
          ))
          .match('empty', () => (
            <DataList>
              <DataListEmptyState />
            </DataList>
          ))
          .match('default', ({ users }) => (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <RankingCard
                  title={t('stats:manager.rankings.bestDrivers')}
                  description={t(
                    'stats:manager.rankings.bestDriversDescription'
                  )}
                  users={users}
                  metricKey="commuteCount"
                />
                <RankingCard
                  title={t('stats:manager.rankings.bestPassengers')}
                  description={t(
                    'stats:manager.rankings.bestPassengersDescription'
                  )}
                  users={users}
                  metricKey="bookingCount"
                />
                <RankingCard
                  title={t('stats:manager.rankings.mostTemplates')}
                  description={t(
                    'stats:manager.rankings.mostTemplatesDescription'
                  )}
                  users={users}
                  metricKey="templateCount"
                />
                <RankingCard
                  title={t('stats:manager.rankings.mostStops')}
                  description={t('stats:manager.rankings.mostStopsDescription')}
                  users={users}
                  metricKey="stopCount"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('stats:manager.table.title')}</CardTitle>
                  <CardDescription>
                    {t('stats:manager.table.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataList>
                    <DataListRow>
                      <DataListCell className="flex-[2]">
                        <DataListTextHeader>
                          {t('stats:manager.table.user')}
                        </DataListTextHeader>
                      </DataListCell>
                      <DataListCell>
                        <DataListTextHeader>
                          {t('stats:manager.table.commutes')}
                        </DataListTextHeader>
                      </DataListCell>
                      <DataListCell>
                        <DataListTextHeader>
                          {t('stats:manager.table.bookings')}
                        </DataListTextHeader>
                      </DataListCell>
                      <DataListCell>
                        <DataListTextHeader>
                          {t('stats:manager.table.templates')}
                        </DataListTextHeader>
                      </DataListCell>
                      <DataListCell>
                        <DataListTextHeader>
                          {t('stats:manager.table.stops')}
                        </DataListTextHeader>
                      </DataListCell>
                    </DataListRow>
                    {users.map((user) => (
                      <DataListRow key={user.id}>
                        <DataListCell className="flex-[2]">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={user.image ?? undefined}
                              alt={user.name}
                            />
                            <AvatarFallback variant="boring" name={user.name} />
                          </Avatar>
                          <DataListText className="font-medium">
                            {user.name}
                          </DataListText>
                        </DataListCell>
                        <DataListCell>
                          <DataListText>{user.commuteCount}</DataListText>
                        </DataListCell>
                        <DataListCell>
                          <DataListText>{user.bookingCount}</DataListText>
                        </DataListCell>
                        <DataListCell>
                          <DataListText>{user.templateCount}</DataListText>
                        </DataListCell>
                        <DataListCell>
                          <DataListText>{user.stopCount}</DataListText>
                        </DataListCell>
                      </DataListRow>
                    ))}
                  </DataList>
                </CardContent>
              </Card>
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
