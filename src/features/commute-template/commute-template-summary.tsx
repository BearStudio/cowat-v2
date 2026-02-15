import { useTranslation } from 'react-i18next';

export const CommuteTemplateSummary = ({
  type,
  stopsCount,
  seats,
}: {
  type: 'ROUND' | 'ONEWAY';
  stopsCount: number;
  seats: number;
}) => {
  const { t } = useTranslation(['commute', 'commuteTemplate']);

  return (
    <>
      {t(`commute:list.type.${type}`)} &middot;{' '}
      {t('commuteTemplate:list.stops', { count: stopsCount })} &middot;{' '}
      {t('commute:list.seats', { count: seats })}
    </>
  );
};
