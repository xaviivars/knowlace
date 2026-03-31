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
      isActive: true
    },
  })
}

export async function getQuestionStats(questionId: string) {

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  })

  if (!question) return null

  const answers = await prisma.answer.findMany({
    where: { questionId },
    include: {
      option: true
    }
  })

  const totalAnswers = answers.length

  const correctAnswers = answers.filter(a => a.option.isCorrect).length

  const optionCounts: Record<string, number> = {}

  for (const answer of answers) {
    optionCounts[answer.optionId] =
      (optionCounts[answer.optionId] || 0) + 1
  }

  return {
    totalAnswers,
    correctAnswers,
    percentage:
      totalAnswers === 0
        ? 0
        : Math.round((correctAnswers / totalAnswers) * 100),
    optionCounts,
  }
}