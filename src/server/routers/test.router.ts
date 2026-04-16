import { os } from '@orpc/server';
import { z } from 'zod';

import { db } from '@/server/db';

export default {
  expireInvitation: os
    .route({ method: 'POST', path: '/expire-invitation' })
    .input(z.object({ invitationId: z.string() }))
    .output(z.void())
    .handler(async ({ input }) => {
      await db.invitation.update({
        where: { id: input.invitationId },
        data: { expiresAt: new Date(Date.now() - 1000 * 60) },
      });
    }),
};
