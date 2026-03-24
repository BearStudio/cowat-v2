import { ClearDbAction } from './clear-db-action';
import { DbSeedAction } from './db-actions';
import { SwitchUserAction } from './switch-user-action';
import { TriggerDailyReminderAction } from './trigger-daily-reminder-action';

export function ActionsDevtoolPanel() {
  return (
    <div className="h-full overflow-auto p-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        <DbSeedAction />
        <ClearDbAction />
        <SwitchUserAction />
        <TriggerDailyReminderAction />
      </div>
    </div>
  );
}
