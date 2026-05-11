import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Car, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { StatsSkeleton } from '@/components/loading/stats-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DataList,
  DataListEmptyState,
  DataListErrorState,
} from '@/components/ui/datalist';
import { SearchInput } from '@/components/ui/search-input';

import { authClient } from '@/features/auth/client';
import { StatCard } from '@/features/stats/manager/stat-card';
import { UserCard } from '@/features/stats/manager/user-card';
import { VisibilityButton } from '@/features/stats/manager/visibility-button';
import { useShouldShowNav } from '@/layout/app/layout';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageStatistics = () => {
  useShouldShowNav('desktop-only');

  const session = authClient.useSession();

  const { t } = useTranslation(['stats', 'components']);

  const [search, setSearch] = useState('');

  const [visibleStats, setVisibleStats] = useState({
    commutes: true,
    bookings: false,
    stops: true,
    templates: false,
  });

  const toggleVisibility = (
    key: 'commutes' | 'bookings' | 'stops' | 'templates'
  ) => {
    setVisibleStats((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
      <PageLayoutTopBar
        className="[view-transition-name:none]"
        startActions={<BackButton viewTransition={{ types: ['slide-down'] }} />}
      >
        <PageLayoutTopBarTitle>Statistics</PageLayoutTopBarTitle>
      </PageLayoutTopBar>

      <PageLayoutContent className="pb-24">
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
            const currentUserId = session.data?.user.id ?? '';
            const currentUser =
              users.find((user) => user.id === currentUserId) ?? users[0];
            if (!currentUser) {
              return null;
            }
            const filteredUsers = users.filter((user) =>
              user.name.toLowerCase().includes(search.toLowerCase())
            );

            return (
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('stats:app.stats')}</CardTitle>

                    <CardDescription>{t('stats:app.manage')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="relative">
                        <StatCard
                          title={t('stats:manager.table.commutes')}
                          value={currentUser.commuteCount}
                          icon={Car}
                        />

                        <VisibilityButton
                          visible={visibleStats.commutes}
                          onClick={() => toggleVisibility('commutes')}
                        />
                      </div>

                      <div className="relative">
                        <StatCard
                          title={t('stats:manager.table.bookings')}
                          value={currentUser.bookingCount}
                          icon={Calendar}
                        />

                        <VisibilityButton
                          visible={visibleStats.bookings}
                          onClick={() => toggleVisibility('bookings')}
                        />
                      </div>

                      <div className="relative">
                        <StatCard
                          title={t('stats:manager.table.stops')}
                          value={currentUser.stopCount}
                          icon={MapPin}
                        />

                        <VisibilityButton
                          visible={visibleStats.stops}
                          onClick={() => toggleVisibility('stops')}
                        />
                      </div>

                      <div className="relative">
                        <StatCard
                          title={t('stats:manager.table.templates')}
                          value={currentUser.templateCount}
                          icon={Users}
                        />
                        <VisibilityButton
                          visible={visibleStats.templates}
                          onClick={() => toggleVisibility('templates')}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle>{t('stats:app.users')}</CardTitle>

                      <CardDescription>
                        {t('stats:app.consult')}
                      </CardDescription>
                    </div>

                    <SearchInput
                      value={search}
                      onChange={(value) => setSearch(value ?? '')}
                      placeholder={t('components:searchInput.placeholder')}
                      className="w-full md:max-w-xs"
                    />
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredUsers.map((user) => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
