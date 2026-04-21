import { PrismaClient } from '@/server/db/generated/client';

const prisma = new PrismaClient();

export async function expireInvitation(invitationId: string): Promise<void> {
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { expiresAt: new Date(Date.now() - 1000 * 60) },
  });
}
