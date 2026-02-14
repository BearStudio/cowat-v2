import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type CardCommutePassengersListProps = {
  passengers: Array<{
    id: string;
    name?: string | null;
    image?: string | null;
  }>;
};

export const CardCommutePassengersList = ({
  passengers,
}: CardCommutePassengersListProps) => {
  const { t } = useTranslation(['commute']);

  if (passengers.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium">{t('commute:list.passengersLabel')}</p>
      <div className="flex flex-wrap gap-2">
        {passengers.map((passenger) => (
          <div
            key={passenger.id}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Avatar size="sm">
              <AvatarImage src={passenger.image ?? undefined} />
              <AvatarFallback variant="boring" name={passenger.name ?? '?'} />
            </Avatar>
            <span>{passenger.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
