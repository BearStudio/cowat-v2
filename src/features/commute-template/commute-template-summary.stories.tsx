import type { Meta } from '@storybook/react-vite';

import { CommuteTemplateSummary } from '@/features/commute-template/commute-template-summary';

export default {
  title: 'Feature/CommuteTemplate/CommuteTemplateSummary',
} satisfies Meta;

export const RoundTrip = () => {
  return <CommuteTemplateSummary type="ROUND" stopsCount={3} seats={4} />;
};

export const OneWay = () => {
  return <CommuteTemplateSummary type="ONEWAY" stopsCount={2} seats={3} />;
};

export const SingleStop = () => {
  return <CommuteTemplateSummary type="ROUND" stopsCount={1} seats={2} />;
};

export const AllVariants = () => {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <CommuteTemplateSummary type="ROUND" stopsCount={3} seats={4} />
      <CommuteTemplateSummary type="ONEWAY" stopsCount={2} seats={2} />
      <CommuteTemplateSummary type="ROUND" stopsCount={1} seats={1} />
    </div>
  );
};
