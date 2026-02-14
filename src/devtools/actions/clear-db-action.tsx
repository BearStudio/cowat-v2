import { useMutation } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/server/db';

const clearDb = createServerFn({ method: 'POST' }).handler(async () => {
  // Truncate all tables in the correct order (respecting foreign keys)
  await db.$executeRawUnsafe(`
    TRUNCATE TABLE
      "passengers_on_stops",
      "template_stop",
      "stop",
      "commute_template",
      "commute",
      "location",
      "verification",
      "account",
      "session",
      "user"
    CASCADE
  `);
  return { success: true };
});

export function ClearDbAction() {
  const mutation = useMutation({
    mutationFn: () => clearDb(),
    onSuccess: () => toast.success('Database cleared'),
    onError: () => toast.error('Failed to clear database'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clear DB</CardTitle>
        <CardDescription>
          Truncate all tables (removes all data)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive-secondary"
          size="sm"
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Clear
        </Button>
      </CardContent>
    </Card>
  );
}
