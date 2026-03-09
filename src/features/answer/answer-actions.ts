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

  if (!question || question.status !== "ACTIVE" ) {
    throw new Error("La pregunta no está activa")
  }

  const now = new Date()

  if (question.endedAt && question.endedAt < now) {
    throw new Error("El tiempo ha terminado")
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  })

  if (!participant || participant.sessionId !== question.sessionId) {
    throw new Error("Participante inválido")
  }

  const selectedOption = question.options.find(
    (opt) => opt.id === optionId
  )

  if (!selectedOption) {
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

  const isCorrect = selectedOption.isCorrect

  let points = 0

  if (isCorrect) {
    points = 100

    await prisma.participant.update({
      where: { id: participantId },
      data: {
        score: {
          increment: points,
        },
      },
    })
  }

  return {
    success: true,
    correct: isCorrect,
    points,
    sessionId: question.sessionId,
  }
}