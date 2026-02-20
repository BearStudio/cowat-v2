import { ORPCError } from '@orpc/client';

export function paginateResult<T extends { id: string }>(
  total: number,
  items: T[],
  limit: number
): { items: T[]; nextCursor: string | undefined; total: number } {
  let nextCursor: string | undefined;
  if (items.length > limit) {
    nextCursor = items.pop()?.id;
  }
  return { items, nextCursor, total };
}

export function getDisabledChannels(
  prefs: ReadonlyArray<{ channel: string }>
): string[] {
  return prefs.map((p) => p.channel.toLowerCase());
}

export function assertDriverOwnership<T extends { driverMemberId: string }>(
  entity: T | null | undefined,
  memberId: string
): asserts entity is T {
  if (!entity) {
    throw new ORPCError('NOT_FOUND');
  }
  if (entity.driverMemberId !== memberId) {
    throw new ORPCError('FORBIDDEN');
  }
}
