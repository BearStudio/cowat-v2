import { Card, CardContent } from '@/components/ui/card';

export const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) => (
  <Card>
    <CardContent className="items-center gap-3 p-4">
      <span className="pl-2 text-sm text-muted-foreground">{title}</span>
      <div className="flex items-center gap-1">
        <div className="rounded-lg p-2">
          <Icon className="size-4" />
        </div>
        <span className="text-lg font-semibold">{value}</span>
      </div>
    </CardContent>
  </Card>
);
