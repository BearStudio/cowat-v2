import { CardSkeleton } from '@/components/loading/card-skeleton';

export const CardListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => i).map((id) => (
        <CardSkeleton key={id} style={{ opacity: 1 - id * 0.2 }} />
      ))}
    </div>
  );
};
