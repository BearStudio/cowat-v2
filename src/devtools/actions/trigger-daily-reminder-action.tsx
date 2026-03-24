import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { triggerDailyReminder } from './trigger-daily-reminder';

export function TriggerDailyReminderAction() {
  const mutation = useMutation({
    mutationFn: () => triggerDailyReminder(),
    onSuccess: () => toast.success('Daily reminder sent'),
    onError: () => toast.error('Daily reminder failed'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Reminder</CardTitle>
        <CardDescription>
          Trigger the daily carpool reminder notification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="secondary"
          size="sm"
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Send reminder
        </Button>
      </CardContent>
    </Card>
  );
}
