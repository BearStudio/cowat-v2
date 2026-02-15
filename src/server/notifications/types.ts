import type { Logger } from 'pino';

import type { RequestStatus } from '@/features/booking/schema';
import type { Commute, CommuteType } from '@/features/commute/schema';
import type { User } from '@/features/user/schema';

export type Recipient = {
  userId: User['id'];
  name: string;
  email: string;
  phone?: string | null;
  slackMemberId?: string | null;
};

type CommutePayload = {
  commuteDate: Commute['date'];
  commuteType: CommuteType;
};

export type BookingRequestedEvent = {
  type: 'booking.requested';
  recipient: Recipient;
  payload: CommutePayload & {
    passengerName: string;
    status: Extract<RequestStatus, 'REQUESTED' | 'ACCEPTED'>;
  };
};

export type BookingAcceptedEvent = {
  type: 'booking.accepted';
  recipient: Recipient;
  payload: CommutePayload & {
    driverName: string;
  };
};

export type BookingRefusedEvent = {
  type: 'booking.refused';
  recipient: Recipient;
  payload: CommutePayload & {
    driverName: string;
  };
};

export type BookingCanceledEvent = {
  type: 'booking.canceled';
  recipient: Recipient;
  payload: CommutePayload & {
    passengerName: string;
  };
};

export type CommuteCreatedEvent = {
  type: 'commute.created';
  recipient: Recipient;
  payload: CommutePayload & {
    driverName: string;
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

export type NotificationEvent =
  | BookingRequestedEvent
  | BookingAcceptedEvent
  | BookingRefusedEvent
  | BookingCanceledEvent
  | CommuteCreatedEvent
  | CommuteUpdatedEvent
  | CommuteCanceledEvent;

export interface NotificationChannel {
  name: string;
  canSend(event: NotificationEvent): boolean;
  send(event: NotificationEvent, logger: Logger): Promise<void>;
}
