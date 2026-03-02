"use server"

import { prisma } from "@/lib/prisma"

export async function submitAnswer({
  participantId,
  questionId,
  optionId,
}: {
  participantId: string
  questionId: string
  optionId: string
}) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { options: true },
  })

  if (!question || !question.isActive) {
    throw new Error("La pregunta no está activa")
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  })

  if (!participant || participant.sessionId !== question.sessionId) {
    throw new Error("Participante inválido")
  }

  const optionBelongsToQuestion = question.options.some(
    (opt) => opt.id === optionId
  )

  if (!optionBelongsToQuestion) {
    throw new Error("Opción inválida")
  }

  const existing = await prisma.answer.findUnique({
    where: {
      participantId_questionId: {
        participantId,
        questionId,
      },
    },
  })

  if (existing) {
    throw new Error("Ya has respondido")
  }

  await prisma.answer.create({
    data: {
      participantId,
      questionId,
      optionId,
    },
  })

  return { success: true }
}