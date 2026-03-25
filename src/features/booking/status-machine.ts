import { ORPCError } from '@orpc/client';

import type { RequestStatus } from '@/features/booking/schema';

export const VALID_STATUS_TRANSITIONS = {
  REQUESTED: ['ACCEPTED', 'REFUSED', 'CANCELED'],
  ACCEPTED: ['CANCELED'],
  REFUSED: ['REQUESTED'],
  CANCELED: ['REQUESTED'],
} as const satisfies Record<RequestStatus, readonly RequestStatus[]>;

export function validateStatusTransition(
  from: RequestStatus,
  to: RequestStatus
): void {
  const allowed: readonly RequestStatus[] = VALID_STATUS_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new ORPCError('BAD_REQUEST', {
      message: `Cannot transition from ${from} to ${to}`,
    });
  }
}
