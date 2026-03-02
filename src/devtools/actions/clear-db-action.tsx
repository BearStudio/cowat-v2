import { useMutation } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { Result } from 'better-result';

import { toast } from '@/lib/toast';

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
  const result = await Result.tryPromise(() =>
    db.$executeRawUnsafe(`
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
    `)
  );

  return result.match({
    ok: () => ({ success: true, output: 'Database cleared' }),
    err: (error) => ({
      success: false,
      output: error instanceof Error ? error.message : String(error),
    }),
  });
});

export function ClearDbAction() {
  const mutation = useMutation({
    mutationFn: () => clearDb(),
    onSuccess: (result) => {
      if (result.success) toast.success('Database cleared');
      else toast.error(`Failed to clear database: ${result.output}`);
    },
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
