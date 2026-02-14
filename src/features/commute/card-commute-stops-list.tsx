import { useTranslation } from 'react-i18next';

type CardCommuteStopsListProps = {
  stops: Array<{
    id: string;
    location: { name: string };
    outwardTime: string;
    inwardTime?: string | null;
  }>;
};

export const CardCommuteStopsList = ({ stops }: CardCommuteStopsListProps) => {
  const { t } = useTranslation(['commute']);

  if (stops.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium">{t('commute:list.stopsLabel')}</p>
      {stops.map((stop, index) => (
        <div
          key={stop.id}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span className="font-medium">{index + 1}.</span>
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
  );
};
