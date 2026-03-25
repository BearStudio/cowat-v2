import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataList, DataListCell, DataListRow } from '@/components/ui/datalist';
import { Skeleton } from '@/components/ui/skeleton';

const RankingCardSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle>
        <Skeleton className="h-5 w-36" />
      </CardTitle>
      <CardDescription>
        <Skeleton className="h-3 w-48" />
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3"
          style={{ opacity: 1 - i * 0.2 }}
        >
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-6" />
        </div>
      ))}
    </CardContent>
  </Card>
);

export const StatsSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <RankingCardSkeleton key={i} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-24" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-3 w-52" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataList>
            <DataListRow>
              {Array.from({ length: 5 }, (_, i) => (
                <DataListCell key={i} className={i === 0 ? 'flex-[2]' : ''}>
                  <Skeleton className="h-3 w-16" />
                </DataListCell>
              ))}
            </DataListRow>
            {Array.from({ length: 3 }, (_, rowIdx) => (
              <DataListRow key={rowIdx} style={{ opacity: 1 - rowIdx * 0.2 }}>
                <DataListCell className="flex-[2]">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </DataListCell>
                {Array.from({ length: 4 }, (_, i) => (
                  <DataListCell key={i}>
                    <Skeleton className="h-4 w-8" />
                  </DataListCell>
                ))}
              </DataListRow>
            ))}
          </DataList>
        </CardContent>
      </Card>
    </div>
  );
};
