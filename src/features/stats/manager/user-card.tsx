import { t } from 'i18next';
import { Calendar, Car, MapPin, Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const MiniStat = ({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
}) => (
  <div className="flex items-center gap-2 rounded-md border p-2">
    <Icon className="size-4 text-muted-foreground" />
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  </div>
);

export const UserCard = ({ user }: { user: any }) => {
  const isActive =
    user.commuteCount > 0 || user.bookingCount > 0 || user.stopCount > 0;

  const formatStat = (visible: boolean, value: number) =>
    visible ? value : '-';

  return (
    <Card className="transition hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback variant="boring" name={user.name} />
          </Avatar>

          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span
              className={`text-xs ${
                isActive ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              {isActive
                ? t('stats:manager.table.active')
                : t('stats:manager.table.inactive')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MiniStat
            icon={Car}
            value={formatStat(user.showCommutes, user.commuteCount)}
            label={t('stats:manager.table.commutes')}
          />
          <MiniStat
            icon={Calendar}
            value={formatStat(user.showBookings, user.bookingCount)}
            label={t('stats:manager.table.bookings')}
          />
          <MiniStat
            icon={MapPin}
            value={formatStat(user.showStops, user.stopCount)}
            label={t('stats:manager.table.stops')}
          />
          <MiniStat
            icon={Users}
            value={formatStat(user.showTemplates, user.templateCount)}
            label={t('stats:manager.table.templates')}
          />
        </div>
      </CardContent>
    </Card>
  );
};
