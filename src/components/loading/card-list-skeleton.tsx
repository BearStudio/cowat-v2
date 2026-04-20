import { CardSkeleton } from '@/components/loading/card-skeleton';

export const CardListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} style={{ opacity: 1 - i * 0.2 }} />
      ))}
    </div>
  );
};
