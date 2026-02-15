import { useTranslation } from 'react-i18next';

import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';

type CardCommuteTemplateHeaderProps = {
  name: React.ReactNode;
  type: 'ROUND' | 'ONEWAY';
  stopsCount: number;
  seats: number;
  actions?: React.ReactNode;
};

export const CardCommuteTemplateHeader = ({
  name,
  type,
  stopsCount,
  seats,
  actions,
}: CardCommuteTemplateHeaderProps) => {
  const { t } = useTranslation(['commuteTemplate']);

  return (
    <>
      <div className="flex items-center gap-2">
        <CardTitle>{name}</CardTitle>
      </div>
      <CardDescription>
        {type}
        {' · '}
        {t('commuteTemplate:list.stops', { count: stopsCount })}
        {' · '}
        {t('commuteTemplate:list.seats', { count: seats })}
      </CardDescription>
      {actions && <CardAction>{actions}</CardAction>}
    </>
  );
};
