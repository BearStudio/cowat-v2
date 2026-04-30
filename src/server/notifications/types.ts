import type { Logger } from 'pino';

import type { RequestStatus, TripType } from '@/features/booking/schema';
import type { Commute, CommuteType } from '@/features/commute/schema';
import type { User } from '@/features/user/schema';
import type { AppDB } from '@/server/db';
import type { NotificationChannelType } from '@/server/db/generated/client';

export type Recipient = {
  userId: User['id'];
  name: string;
  email: string;
  phone?: string | null;
  notificationPreferences?: ReadonlyArray<{
    channel: NotificationChannelType;
  }>;
};

// Used by commute events (driver's commute type: ROUND | ONEWAY)
type CommutePayload = {
  commuteDate: Commute['date'];
  commuteType: CommuteType;
};

// Used by booking events (passenger's trip type: ROUND | ONEWAY | RETURN)
type BookingPayload = {
  commuteDate: Commute['date'];
  tripType: TripType;
};

export type BookingRequestedEvent = {
  type: 'booking.requested';
  recipient: Recipient;
  payload: BookingPayload & {
    passengerName: string;
    status: Extract<RequestStatus, 'REQUESTED' | 'ACCEPTED'>;
    orgSlug: string;
  };
};

export type BookingAcceptedEvent = {
  type: 'booking.accepted';
  recipient: Recipient;
  payload: BookingPayload & {
    driverName: string;
    orgSlug: string;
  };
};

export type BookingRefusedEvent = {
  type: 'booking.refused';
  recipient: Recipient;
  payload: BookingPayload & {
    driverName: string;
    orgSlug: string;
  };
};

export type BookingCanceledEvent = {
  type: 'booking.canceled';
  recipient: Recipient;
  payload: BookingPayload & {
    passengerName: string;
    orgSlug: string;
  };
};

export type BookingCanceledByDriverEvent = {
  type: 'booking.canceledByDriver';
  recipient: Recipient;
  payload: CommutePayload & {
    driverName: string;
    orgSlug: string;
  };
};

export type CommuteCreatedStop = {
  stopId: string;
  locationName: string;
  locationAddress?: string | null;
  outwardTime: string;
  inwardTime?: string | null;
};

export type CommuteCreatedEvent = {
  type: 'commute.created';
  payload: CommutePayload & {
    commuteId: string;
    driverName: string;
    driverEmail: string;
    seats: number;
    stops: CommuteCreatedStop[];
    orgSlug: string;
  };
};

export type CommuteUpdatedEvent = {
  type: 'commute.updated';
  recipient: Recipient;
  payload: CommutePayload & {
    driverName: string;
    orgSlug: string;
    // New values after the update (CommutePayload fields hold the previous values)
    newCommuteDate: Commute['date'];
    newCommuteType: CommuteType;
  };
};

export type CommuteCanceledEvent = {
  type: 'commute.canceled';
  recipient: Recipient;
  payload: CommutePayload & {
    driverName: string;
    orgSlug: string;
  };
};

export type CommuteRequestedEvent = {
  type: 'commute.requested';
  payload: {
    requesterName: string;
    requesterEmail: string;
    commuteDate: Commute['date'];
    orgSlug: string;
    locationName?: string;
    commuteRequestId: string;
  };
};

export type ReminderCommute = {
  date: Commute['date'];
  driverName: string;
  driverUserId: User['id'];
  passengers: Array<{ name: string; userId: User['id'] }>;
};

export function getCommutesForRecipient(
  commutes: ReminderCommute[],
  recipientUserId: string
): ReminderCommute[] {
  return commutes.filter(
    (c) =>
      c.driverUserId === recipientUserId ||
      c.passengers.some((p) => p.userId === recipientUserId)
  );
}

export type CommuteReminderEvent = {
  type: 'commute.reminder';
  recipients: Recipient[];
  payload: {
    commutes: ReminderCommute[];
    orgSlug: string;
  };
};

export type CommuteAlertEvent = {
  type: 'commute.alert';
  recipient: Recipient;
  payload: {
    senderName: string;
    alertType: 'late' | 'arrived' | 'custom';
    customMessage?: string;
    lateMinutes?: number;
    commuteDate: Commute['date'];
    tripType: TripType;
    orgSlug: string;
  };
};

export type NotificationEvent =
  | BookingRequestedEvent
  | BookingAcceptedEvent
  | BookingRefusedEvent
  | BookingCanceledEvent
  | BookingCanceledByDriverEvent
  | CommuteCreatedEvent
  | CommuteUpdatedEvent
  | CommuteCanceledEvent
  | CommuteRequestedEvent
  | CommuteReminderEvent
  | CommuteAlertEvent;

export type EventWithRecipient = Extract<
  NotificationEvent,
  { recipient: Recipient }
>;

export type NotifyOrgContext = {
  db: AppDB;
  organizationId: string;
};

export type AllowedNotificationChannels = NotificationChannelType | 'TERMINAL';

export interface NotificationChannel {
  name: AllowedNotificationChannels;
  canSend(
    event: NotificationEvent,
    orgContext?: NotifyOrgContext
  ): boolean | Promise<boolean>;
  send(
    event: NotificationEvent,
    logger: Logger,
    orgContext?: NotifyOrgContext
  ): Promise<void>;
}
