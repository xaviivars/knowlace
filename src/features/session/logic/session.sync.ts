import { Socket } from "socket.io"
import { prisma } from "@/lib/prisma"
import { getQuestionStats } from "@/features/session/session-service"

export async function syncActiveQuestion(socket: Socket, sessionId: string) {

  const activeQuestion = await prisma.question.findFirst({
    where: {
      sessionId,
      isActive: true,
    },
  })

  if (!activeQuestion || !activeQuestion.startedAt || !activeQuestion.endedAt) {
    return
  }

  const now = new Date()

  const remaining = Math.max(
    0,
    Math.floor(
      (activeQuestion.endedAt.getTime() - now.getTime()) / 1000
    )
  )

  if (remaining > 0) {

    socket.emit("question-started", {
      questionId: activeQuestion.id,
      timeLimit: remaining,
      startedAt: activeQuestion.startedAt,
    })

  } else {

    await prisma.question.update({
      where: { id: activeQuestion.id },
      data: { isActive: false },
    })

    const stats = await getQuestionStats(activeQuestion.id)

    socket.emit("question-ended")

    socket.emit("question-stats-updated", {
      questionId: activeQuestion.id,
      ...stats
    })

  }

}