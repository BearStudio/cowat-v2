import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataList, DataListCell, DataListRow } from '@/components/ui/datalist';
import { Skeleton } from '@/components/ui/skeleton';

const RANK_KEYS = ['rank-1', 'rank-2', 'rank-3'] as const;
const CARD_KEYS = ['card-1', 'card-2', 'card-3', 'card-4'] as const;
const HEADER_KEYS = ['hdr-1', 'hdr-2', 'hdr-3', 'hdr-4', 'hdr-5'] as const;
const ROW_KEYS = ['row-1', 'row-2', 'row-3'] as const;
const CELL_KEYS = ['cell-1', 'cell-2', 'cell-3', 'cell-4'] as const;

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
      {RANK_KEYS.map((key, i) => (
        <div
          key={key}
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
        {CARD_KEYS.map((key) => (
          <RankingCardSkeleton key={key} />
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
              {HEADER_KEYS.map((key, i) => (
                <DataListCell key={key} className={i === 0 ? 'flex-[2]' : ''}>
                  <Skeleton className="h-3 w-16" />
                </DataListCell>
              ))}
            </DataListRow>
            {ROW_KEYS.map((rowKey, rowIdx) => (
              <DataListRow key={rowKey} style={{ opacity: 1 - rowIdx * 0.2 }}>
                <DataListCell className="flex-[2]">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </DataListCell>
                {CELL_KEYS.map((cellKey) => (
                  <DataListCell key={cellKey}>
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
