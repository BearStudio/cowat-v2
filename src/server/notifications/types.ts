import type { Logger } from 'pino';

import type { RequestStatus, TripType } from '@/features/booking/schema';
import type { Commute, CommuteType } from '@/features/commute/schema';
import type { User } from '@/features/user/schema';
import type { AppDB } from '@/server/db';

export type Recipient = {
  userId: User['id'];
  name: string;
  email: string;
  phone?: string | null;
  notificationPreferences?: ReadonlyArray<{ channel: string }>;
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
  };
};

export type BookingRefusedEvent = {
  type: 'booking.refused';
  recipient: Recipient;
  payload: BookingPayload & {
    driverName: string;
  };
};

export type BookingCanceledEvent = {
  type: 'booking.canceled';
  recipient: Recipient;
  payload: BookingPayload & {
    passengerName: string;
  };
};

export type CommuteCreatedStop = {
  locationName: string;
  outwardTime: string;
  inwardTime?: string | null;
};

export type CommuteCreatedEvent = {
  type: 'commute.created';
  payload: CommutePayload & {
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
  };
};

export type CommuteCanceledEvent = {
  type: 'commute.canceled';
  recipient: Recipient;
  payload: CommutePayload & {
    driverName: string;
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
  };
};

export type NotificationEvent =
  | BookingRequestedEvent
  | BookingAcceptedEvent
  | BookingRefusedEvent
  | BookingCanceledEvent
  | CommuteCreatedEvent
  | CommuteUpdatedEvent
  | CommuteCanceledEvent
  | CommuteRequestedEvent;

export type NotifyOrgContext = {
  db: AppDB;
  organizationId: string;
};

export interface NotificationChannel {
  name: string;
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
