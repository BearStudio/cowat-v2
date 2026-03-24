import { useMutation } from '@tanstack/react-query';
import { BellIcon, MessageSquareIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { triggerDailyReminder } from '@/devtools/actions/trigger-daily-reminder';

export function DevtoolsSidebarGroup() {
  const reminderMutation = useMutation({
    mutationFn: () => triggerDailyReminder(),
    onSuccess: () => toast.success('Daily reminder sent'),
    onError: () => toast.error('Daily reminder failed'),
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Devtools</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <a href="/api/dev/slack/booking-requested">
                  <MessageSquareIcon />
                  <span>Slack templates</span>
                </a>
              }
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="cursor-pointer"
              disabled={reminderMutation.isPending}
              onClick={() => reminderMutation.mutate()}
              render={
                <span>
                  <BellIcon />
                  <span>Trigger daily reminder</span>
                </span>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
