import { ORPCError } from '@orpc/client';
import { z, type ZodType } from 'zod';

export const zPaginationInput = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).prefault(20),
});

export function zPaginatedOutput<T extends ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().optional(),
    total: z.number(),
  });
}

export function paginateResult<T extends { id: string }>(
  total: number,
  items: T[],
  limit: number
): { items: T[]; nextCursor: string | undefined; total: number };
export function paginateResult<T extends { id: string }, U>(
  total: number,
  items: T[],
  limit: number,
  map: (item: T) => U
): { items: U[]; nextCursor: string | undefined; total: number };
export function paginateResult(
  total: number,
  items: { id: string }[],
  limit: number,
  map?: (item: any) => any
) {
  let nextCursor: string | undefined;
  if (items.length > limit) {
    nextCursor = items.pop()?.id;
  }
  return { items: map ? items.map(map) : items, nextCursor, total };
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
