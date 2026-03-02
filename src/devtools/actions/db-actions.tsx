import { useMutation } from '@tanstack/react-query';

import { toast } from '@/lib/toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { type CommandResult, runCommand } from './run-command';

export function DbSeedAction() {
  const mutation = useMutation({
    mutationFn: () => runCommand({ data: 'db:seed' }),
    onSuccess: (result: CommandResult) => {
      if (result.success) toast.success('db:seed completed');
      else toast.error(`db:seed failed: ${result.output}`);
    },
    onError: () => toast.error('db:seed failed'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seed DB</CardTitle>
        <CardDescription>Run database seed script</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="secondary"
          size="sm"
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          db:seed
        </Button>
      </CardContent>
    </Card>
  );
}
