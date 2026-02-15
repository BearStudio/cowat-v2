import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { StatsUser } from '@/features/stats/schema';

export const RankingCard = (props: {
  title: string;
  description: string;
  users: Array<StatsUser>;
  metricKey: keyof Pick<
    StatsUser,
    'commuteCount' | 'bookingCount' | 'templateCount' | 'stopCount'
  >;
}) => {
  const ranked = [...props.users]
    .sort((a, b) => b[props.metricKey] - a[props.metricKey])
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ranked.map((user, index) => (
          <div key={user.id} className="flex items-center gap-3">
            <Badge
              variant={index === 0 ? 'default' : 'secondary'}
              className="w-6 justify-center"
            >
              {index + 1}
            </Badge>
            <Avatar className="size-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback variant="boring" name={user.name} />
            </Avatar>
            <span className="flex-1 truncate text-sm font-medium">
              {user.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {user[props.metricKey]}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
