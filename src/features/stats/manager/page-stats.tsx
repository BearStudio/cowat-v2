import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Car, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { StatsSkeleton } from '@/components/loading/stats-skeleton';
import { Button } from '@/components/ui/button';
import {
  DataList,
  DataListEmptyState,
  DataListErrorState,
} from '@/components/ui/datalist';
import { SearchButton } from '@/components/ui/search-button';
import { SearchInput } from '@/components/ui/search-input';

import { RankingCard } from '@/features/stats/manager/ranking-card';
import { StatCard } from '@/features/stats/manager/stat-card';
import { UserCard } from '@/features/stats/manager/user-card';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageStats = () => {
  const { t } = useTranslation(['stats', 'components']);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active'>('all');

  const statsQuery = useQuery(orpc.stats.getAll.queryOptions());

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
        <div className="flex flex-1 items-center justify-between">
          <SearchButton
            value={search}
            onChange={(value) => setSearch(value ?? '')}
            className="-mx-2 md:hidden"
            size="icon-sm"
          />
          <SearchInput
            value={search}
            onChange={(value) => setSearch(value ?? '')}
            size="sm"
            className="max-w-xs max-md:hidden"
          />
          <div className="ml-2 flex items-center gap-2">
            <Button
              size="xs"
              onClick={() => setFilter('active')}
              variant={filter === 'active' ? 'default' : 'secondary'}
            >
              {t('stats:manager.table.active')}
            </Button>
            <Button
              size="xs"
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'secondary'}
            >
              {t('stats:manager.table.allUsers')}
            </Button>
          </div>
        </div>
      </PageLayoutTopBar>
      <PageLayoutContent className="pb-20">
        {ui
          .match('pending', () => <StatsSkeleton />)
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
          .match('default', ({ users }) => {
            const totals = {
              commutes: users.reduce((acc, u) => acc + u.commuteCount, 0),
              bookings: users.reduce((acc, u) => acc + u.bookingCount, 0),
              stops: users.reduce((acc, u) => acc + u.stopCount, 0),
            };
            const activeUsers = users.filter(
              (u) => u.commuteCount > 0 || u.bookingCount > 0 || u.stopCount > 0
            ).length;
            const filteredUsers = users.filter((u) => {
              const isActive =
                u.commuteCount > 0 || u.bookingCount > 0 || u.stopCount > 0;
              const matchesSearch = u.name
                .toLowerCase()
                .includes(search.toLowerCase());
              if (!matchesSearch) return false;
              if (filter === 'active') return isActive;
              return true;
            });

            return (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <StatCard
                    title={t('stats:manager.table.commutes')}
                    value={totals.commutes}
                    icon={Car}
                  />
                  <StatCard
                    title={t('stats:manager.table.bookings')}
                    value={totals.bookings}
                    icon={Calendar}
                  />
                  <StatCard
                    title={t('stats:manager.table.activeUsers')}
                    value={activeUsers}
                    icon={Users}
                  />
                  <StatCard
                    title={t('stats:manager.table.stops')}
                    value={totals.stops}
                    icon={MapPin}
                  />
                </div>

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
                    description={t(
                      'stats:manager.rankings.mostStopsDescription'
                    )}
                    users={users}
                    metricKey="stopCount"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </div>
            );
          })
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
