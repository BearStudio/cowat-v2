import { CardSkeleton } from '@/components/loading/card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 3 }, (_, dayIndex) => (
        <div key={dayIndex} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28" />
            <div className="ml-auto" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>

          <div className="flex flex-col gap-3">
            {Array.from({ length: dayIndex === 0 ? 2 : 1 }, (_, cardIndex) => (
              <CardSkeleton
                key={cardIndex}
                className="border-l-4 border-l-neutral-300 dark:border-l-neutral-600"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
