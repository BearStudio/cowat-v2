import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';

import { CommuteTemplateSummary } from '@/features/commute-template/commute-template-summary';

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
  return (
    <>
      <div className="flex items-center gap-2">
        <CardTitle>{name}</CardTitle>
      </div>
      <CardDescription>
        <CommuteTemplateSummary
          type={type}
          stopsCount={stopsCount}
          seats={seats}
        />
      </CardDescription>
      {actions && <CardAction>{actions}</CardAction>}
    </>
  );
};
