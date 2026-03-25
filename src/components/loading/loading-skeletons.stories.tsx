import type { Meta } from '@storybook/react-vite';

import { CardListSkeleton } from '@/components/loading/card-list-skeleton';
import { DashboardSkeleton } from '@/components/loading/dashboard-skeleton';
import { StatsSkeleton } from '@/components/loading/stats-skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DataList,
  DataListCell,
  DataListLoadingState,
  DataListRow,
  DataListText,
  DataListTextHeader,
} from '@/components/ui/datalist';

export default {
  title: 'UI/Loading Skeletons',
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

const SideBySide = ({
  loaded,
  skeleton,
}: {
  loaded: React.ReactNode;
  skeleton: React.ReactNode;
}) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase">
        Skeleton
      </span>
      {skeleton}
    </div>
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase">
        Loaded
      </span>
      {loaded}
    </div>
  </div>
);

// -- Card List --

const CardListLoaded = () => (
  <div className="flex flex-col gap-3">
    {[
      { name: 'Marie Dupont', date: 'Lundi 24 mars', type: 'Aller-retour' },
      { name: 'Jean Martin', date: 'Mardi 25 mars', type: 'Aller simple' },
      { name: 'Sophie Leroy', date: 'Mercredi 26 mars', type: 'Aller-retour' },
    ].map((item) => (
      <Card key={item.name} className="border-l-4 border-l-neutral-400">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar size="xl" className="rounded-sm">
              <AvatarFallback variant="boring" name={item.name} />
            </Avatar>
            <div className="flex min-w-0 flex-col gap-0.5">
              <CardTitle className="truncate capitalize">{item.date}</CardTitle>
              <CardDescription className="truncate">
                {item.name}
              </CardDescription>
            </div>
          </div>
          <CardAction>
            <Badge variant="secondary" size="sm">
              {item.type}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>08:00 · 2/4 places</span>
            <span>17:30 · 2/4 places</span>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const CardList = () => (
  <SideBySide skeleton={<CardListSkeleton />} loaded={<CardListLoaded />} />
);

// -- Dashboard --

const DashboardLoaded = () => (
  <div className="flex flex-col gap-6">
    {["Aujourd'hui", 'Jeudi 27 mars', 'Vendredi 28 mars'].map(
      (day, dayIndex) => (
        <div key={day} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">{day}</h2>
          </div>
          <div className="flex flex-col gap-3">
            {(dayIndex === 0
              ? [
                  { name: 'Marie Dupont', type: 'Aller-retour' },
                  { name: 'Jean Martin', type: 'Aller simple' },
                ]
              : [{ name: 'Sophie Leroy', type: 'Aller-retour' }]
            ).map((item) => (
              <Card key={item.name} className="border-l-4 border-l-neutral-400">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar size="xl" className="rounded-sm">
                      <AvatarFallback variant="boring" name={item.name} />
                    </Avatar>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <CardTitle className="truncate capitalize">
                        {day}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {item.name}
                      </CardDescription>
                    </div>
                  </div>
                  <CardAction>
                    <Badge variant="secondary" size="sm">
                      {item.type}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-muted-foreground">
                    08:00 · 2/4 places
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    )}
  </div>
);

export const Dashboard = () => (
  <SideBySide skeleton={<DashboardSkeleton />} loaded={<DashboardLoaded />} />
);

// -- Stats --

const StatsLoaded = () => {
  const users = [
    {
      name: 'Marie Dupont',
      commutes: 12,
      bookings: 8,
      templates: 3,
      stops: 24,
    },
    { name: 'Jean Martin', commutes: 9, bookings: 15, templates: 2, stops: 18 },
    { name: 'Sophie Leroy', commutes: 7, bookings: 5, templates: 4, stops: 14 },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { title: 'Meilleurs conducteurs', desc: 'Plus de trajets proposés' },
          { title: 'Meilleurs passagers', desc: 'Plus de réservations' },
          { title: 'Plus de templates', desc: 'Templates créés' },
          { title: "Plus d'arrêts", desc: 'Arrêts desservis' },
        ].map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {users.map((user, i) => (
                <div key={user.name} className="flex items-center gap-3">
                  <Badge
                    variant={i === 0 ? 'default' : 'secondary'}
                    className="w-6 justify-center"
                  >
                    {i + 1}
                  </Badge>
                  <Avatar className="size-8">
                    <AvatarFallback variant="boring" name={user.name} />
                  </Avatar>
                  <span className="flex-1 truncate text-sm font-medium">
                    {user.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {user.commutes}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail</CardTitle>
          <CardDescription>Statistiques par utilisateur</CardDescription>
        </CardHeader>
        <CardContent>
          <DataList>
            <DataListRow>
              <DataListCell className="flex-[2]">
                <DataListTextHeader>Utilisateur</DataListTextHeader>
              </DataListCell>
              <DataListCell>
                <DataListTextHeader>Trajets</DataListTextHeader>
              </DataListCell>
              <DataListCell>
                <DataListTextHeader>Réservations</DataListTextHeader>
              </DataListCell>
              <DataListCell>
                <DataListTextHeader>Templates</DataListTextHeader>
              </DataListCell>
              <DataListCell>
                <DataListTextHeader>Arrêts</DataListTextHeader>
              </DataListCell>
            </DataListRow>
            {users.map((user) => (
              <DataListRow key={user.name}>
                <DataListCell className="flex-[2]">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarFallback variant="boring" name={user.name} />
                    </Avatar>
                    <DataListText className="font-medium">
                      {user.name}
                    </DataListText>
                  </div>
                </DataListCell>
                <DataListCell>
                  <DataListText>{user.commutes}</DataListText>
                </DataListCell>
                <DataListCell>
                  <DataListText>{user.bookings}</DataListText>
                </DataListCell>
                <DataListCell>
                  <DataListText>{user.templates}</DataListText>
                </DataListCell>
                <DataListCell>
                  <DataListText>{user.stops}</DataListText>
                </DataListCell>
              </DataListRow>
            ))}
          </DataList>
        </CardContent>
      </Card>
    </div>
  );
};

export const Stats = () => (
  <SideBySide skeleton={<StatsSkeleton />} loaded={<StatsLoaded />} />
);

// -- DataList --

const DataListLoaded = () => (
  <DataList>
    {[
      { name: 'Marie Dupont', email: 'marie.dupont@example.com' },
      { name: 'Jean Martin', email: 'jean.martin@example.com' },
      { name: 'Sophie Leroy', email: 'sophie.leroy@example.com' },
    ].map((user) => (
      <DataListRow key={user.name} withHover>
        <DataListCell className="flex-none">
          <Avatar>
            <AvatarFallback variant="boring" name={user.name} />
          </Avatar>
        </DataListCell>
        <DataListCell>
          <DataListText className="font-medium">{user.name}</DataListText>
          <DataListText className="text-xs text-muted-foreground">
            {user.email}
          </DataListText>
        </DataListCell>
        <DataListCell className="flex-[0.5] max-sm:hidden">
          <Badge variant="secondary">user</Badge>
        </DataListCell>
      </DataListRow>
    ))}
  </DataList>
);

export const DataListLoading = () => (
  <SideBySide
    skeleton={
      <DataList>
        <DataListLoadingState />
      </DataList>
    }
    loaded={<DataListLoaded />}
  />
);
