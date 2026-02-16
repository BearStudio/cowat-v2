import { z } from 'zod';

export const zInviteForm = z.object({
  email: z.string().email(),
  role: z.enum(['owner', 'member']),
});
