import { z } from 'zod';

import { zUserSummary } from '@/features/commute/schema';

export const zCommuteRequestStatus = () =>
  z.enum(['OPEN', 'FULFILLED', 'CANCELED']);
export type CommuteRequestStatus = z.infer<
  ReturnType<typeof zCommuteRequestStatus>
>;

export type CommuteRequestForList = z.infer<
  ReturnType<typeof zCommuteRequestForList>
>;
export const zCommuteRequestForList = () =>
  z.object({
    id: z.string(),
    date: z.date(),
    destination: z.string().nullish(),
    status: zCommuteRequestStatus(),
    createdAt: z.date(),
    requester: zUserSummary(),
  });
