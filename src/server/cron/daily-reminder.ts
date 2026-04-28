import type { Logger } from 'pino';

import type { AppDB } from '@/server/db';
import type { Notifier } from '@/server/notifications/notifier';
import type { Recipient, ReminderCommute } from '@/server/notifications/types';
import { createCommuteRepository } from '@/server/repositories/commute.repository';

/**
 * Hour (UTC) at which the cron runs and the reminder window starts.
 * Must match the schedule in vercel.json.
 */
const REMINDER_WINDOW_START_HOUR_UTC = 7;

/** The reminder window spans 24h: [today at START_HOUR, tomorrow at START_HOUR[. */
function getReminderWindow(now: Date) {
  const from = new Date(now);
  from.setUTCHours(REMINDER_WINDOW_START_HOUR_UTC, 0, 0, 0);

  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 1);

  return { from, to };
}

type OrgData = {
  orgId: string;
  orgSlug: string;
  commutes: ReminderCommute[];
  recipients: Map<string, Recipient>;
};

async function getTodayCommutes(db: AppDB) {
  const { from, to } = getReminderWindow(new Date());
  const commutes = createCommuteRepository(db);
  return commutes.findAllForRange(from, to, { includePreferences: true });
}

function summarize(orgDataByOrgId: Map<string, OrgData>, commuteCount: number) {
  const totalRecipients = [...orgDataByOrgId.values()].reduce(
    (sum, o) => sum + o.recipients.size,
    0
  );
  return {
    commutes: commuteCount,
    recipients: totalRecipients,
    orgs: orgDataByOrgId.size,
  };
}

/**
 * Find all commutes in the reminder window across all organizations,
 * collect every participant (drivers + accepted passengers),
 * and send one commute.reminder event per org via the notifier.
 */
export async function sendDailyReminders(
  db: AppDB,
  notifier: Notifier,
  logger: Logger
) {
  const todayCommutes = await getTodayCommutes(db);

  if (todayCommutes.length === 0) {
    logger.info('[CRON] No commutes today, nothing to send');
    return;
  }

  const orgDataByOrgId = groupParticipantsByOrg(todayCommutes);
  for (const [orgId, orgData] of orgDataByOrgId.entries()) {
    const hasPassengerCommute = orgData.commutes.some(
      (commute) => commute.passengers.length > 0
    );
    if (!hasPassengerCommute) {
      orgDataByOrgId.delete(orgId);
    }
  }

  await notifyEachOrg(orgDataByOrgId, db, notifier, logger);

  logger.info(
    summarize(orgDataByOrgId, todayCommutes.length),
    '[CRON] Daily reminder notifications sent'
  );
}

type RangeCommute = Awaited<
  ReturnType<ReturnType<typeof createCommuteRepository>['findAllForRange']>
>[number];

type MemberData = RangeCommute['driver'];

function toRecipient(member: MemberData): Recipient {
  return {
    userId: member.userId,
    name: member.user.name,
    email: member.user.email,
    notificationPreferences: member.notificationPreferences,
  };
}

function registerRecipient(
  recipients: Map<string, Recipient>,
  member: MemberData
) {
  if (!recipients.has(member.userId)) {
    recipients.set(member.userId, toRecipient(member));
  }
}

function collectPassengers(
  commute: RangeCommute,
  recipients: Map<string, Recipient>
): ReminderCommute['passengers'] {
  const passengers: ReminderCommute['passengers'] = [];
  for (const stop of commute.stops) {
    for (const booking of stop.passengers) {
      const member = booking.passenger;
      passengers.push({ name: member.user.name, userId: member.userId });
      registerRecipient(recipients, member);
    }
  }
  return passengers;
}

function getOrCreateOrgData(
  orgDataByOrgId: Map<string, OrgData>,
  driver: MemberData
): OrgData {
  const orgId = driver.organizationId;
  let orgData = orgDataByOrgId.get(orgId);
  if (!orgData) {
    orgData = {
      orgId,
      orgSlug: driver.organization.slug,
      commutes: [],
      recipients: new Map(),
    };
    orgDataByOrgId.set(orgId, orgData);
  }
  return orgData;
}

function groupParticipantsByOrg(todayCommutes: RangeCommute[]) {
  const orgDataByOrgId = new Map<string, OrgData>();

  for (const commute of todayCommutes) {
    const orgData = getOrCreateOrgData(orgDataByOrgId, commute.driver);

    const passengers = collectPassengers(commute, orgData.recipients);

    if (passengers.length > 0) {
      registerRecipient(orgData.recipients, commute.driver);
    }

    orgData.commutes.push({
      date: commute.date,
      driverName: commute.driver.user.name,
      driverUserId: commute.driver.userId,
      passengers,
    });
  }

  return orgDataByOrgId;
}

async function notifyEachOrg(
  orgDataByOrgId: Map<string, OrgData>,
  db: AppDB,
  notifier: Notifier,
  logger: Logger
) {
  const promises = [...orgDataByOrgId.values()].map((orgData) =>
    notifier.notify(
      {
        type: 'commute.reminder',
        recipients: [...orgData.recipients.values()],
        payload: {
          commutes: orgData.commutes,
          orgSlug: orgData.orgSlug,
        },
      },
      logger,
      { db, organizationId: orgData.orgId }
    )
  );

  await Promise.allSettled(promises);
}
