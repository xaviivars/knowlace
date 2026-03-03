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

export async function getLeaderboardByAccessCode(accessCode: string) {
  const session = await prisma.teachingSession.findUnique({
    where: { accessCode },
  })

  if (!session) return null

  return prisma.participant.findMany({
    where: {
      sessionId: session.id,
    },
    orderBy: {
      score: "desc",
    },
    select: {
      id: true,
      name: true,
      score: true,
    },
  })
}

export async function getQuestionStats(questionId: string) {
  const totalAnswers = await prisma.answer.count({
    where: { questionId },
  })

  const correctAnswers = await prisma.answer.count({
    where: {
      questionId,
      option: {
        isCorrect: true,
      },
    },
  })

  return {
    totalAnswers,
    correctAnswers,
    percentage:
      totalAnswers === 0
        ? 0
        : Math.round((correctAnswers / totalAnswers) * 100),
  }
}