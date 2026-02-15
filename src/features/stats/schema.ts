import { z } from 'zod';

export type StatsUser = z.infer<ReturnType<typeof zStatsUser>>;
export const zStatsUser = () =>
  z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullable(),
    commuteCount: z.number(),
    bookingCount: z.number(),
    templateCount: z.number(),
    stopCount: z.number(),
  });
