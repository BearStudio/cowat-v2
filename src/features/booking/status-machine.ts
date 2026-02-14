import { ORPCError } from '@orpc/client';

import type { RequestStatus } from '@/features/booking/schema';

export const VALID_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> =
  {
    REQUESTED: ['ACCEPTED', 'REFUSED', 'CANCELED'],
    ACCEPTED: ['CANCELED'],
    REFUSED: [],
    CANCELED: [],
  };

export function validateStatusTransition(
  from: RequestStatus,
  to: RequestStatus
): void {
  if (!VALID_STATUS_TRANSITIONS[from].includes(to)) {
    throw new ORPCError('BAD_REQUEST', {
      message: `Cannot transition from ${from} to ${to}`,
    });
  }
}
