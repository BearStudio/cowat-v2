import { Card, CardAction, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const CardSkeleton = (props: React.ComponentProps<typeof Card>) => {
  return (
    <Card {...props}>
      <CardHeader>
        {/* Row 1: Avatar + title/description */}
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 flex-none rounded-sm" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
        <CardAction>
          <Skeleton className="size-4 rounded-sm" />
        </CardAction>

        {/* Row 2: Badges */}
        <div className="col-span-full flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-5 w-16 rounded-sm" />
        </div>

        {/* Row 3: Trip info */}
        <div className="col-span-full flex items-center gap-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-28" />
        </div>
      </CardHeader>
    </Card>
  );
};
