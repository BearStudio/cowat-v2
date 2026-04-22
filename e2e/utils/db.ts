import { envServer } from '@/env/server';
import { PrismaClient } from '@/server/db/generated/client';

let prisma: PrismaClient | undefined;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: envServer.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
}

export async function expireInvitation(invitationId: string): Promise<void> {
  const db = getPrisma();

  await db.invitation.update({
    where: { id: invitationId },
    data: { expiresAt: new Date(Date.now() - 1000 * 60) },
  });
}
