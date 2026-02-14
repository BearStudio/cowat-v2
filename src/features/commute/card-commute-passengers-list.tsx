import { useTranslation } from 'react-i18next';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type CardCommutePassengersListProps = {
  passengers: Array<{
    id: string;
    name?: string | null;
    image?: string | null;
  }>;
};

const AVATAR_GROUP_THRESHOLD = 3;

export const CardCommutePassengersList = ({
  passengers,
}: CardCommutePassengersListProps) => {
  const { t } = useTranslation(['commute']);

  if (passengers.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium">{t('commute:list.passengersLabel')}</p>
      {passengers.length >= AVATAR_GROUP_THRESHOLD ? (
        <Popover>
          <PopoverTrigger
            render={<button type="button" />}
            className="w-fit cursor-pointer"
          >
            <AvatarGroup>
              {passengers.slice(0, AVATAR_GROUP_THRESHOLD).map((passenger) => (
                <Avatar key={passenger.id} size="sm">
                  <AvatarImage src={passenger.image ?? undefined} />
                  <AvatarFallback
                    variant="boring"
                    name={passenger.name ?? '?'}
                  />
                </Avatar>
              ))}
              {passengers.length > AVATAR_GROUP_THRESHOLD && (
                <AvatarGroupCount>
                  +{passengers.length - AVATAR_GROUP_THRESHOLD}
                </AvatarGroupCount>
              )}
            </AvatarGroup>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-fit">
            <div className="flex flex-col gap-2">
              {passengers.map((passenger) => (
                <div
                  key={passenger.id}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <Avatar size="sm">
                    <AvatarImage src={passenger.image ?? undefined} />
                    <AvatarFallback
                      variant="boring"
                      name={passenger.name ?? '?'}
                    />
                  </Avatar>
                  <span>{passenger.name}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
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
      )}
    </div>
  );
};
