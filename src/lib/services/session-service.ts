import { prisma } from "@/lib/prisma"

export async function getParticipantsByAccessCode(accessCode: string) {
  const session = await prisma.teachingSession.findUnique({
    where: { accessCode },
  })

  if (!session) return null

  return prisma.participant.findMany({
    where: {
      sessionId: session.id,
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
  })
}