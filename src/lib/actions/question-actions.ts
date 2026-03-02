"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

async function assertOwner(sessionId: string) {
  const sessionAuth = await auth.api.getSession({
    headers: await headers(),
  })

  if (!sessionAuth) {
    throw new Error("Unauthorized")
  }

  const session = await prisma.teachingSession.findUnique({
    where: { id: sessionId },
  })

  if (!session || session.ownerId !== sessionAuth.user.id) {
    throw new Error("Forbidden")
  }

  return session
}

export async function createQuestionAction(params: {
  sessionId: string
  content: string
  options: { content: string; isCorrect: boolean }[]
}) {
  const { sessionId, content, options } = params

  await assertOwner(sessionId)

  if (!content || content.trim().length < 5) {
    throw new Error("Contenido inválido")
  }

  if (!options || options.length < 2) {
    throw new Error("Debe haber al menos 2 opciones")
  }

  const correctCount = options.filter(o => o.isCorrect).length
  if (correctCount !== 1) {
    throw new Error("Debe haber exactamente una opción correcta")
  }

  const lastQuestion = await prisma.question.findFirst({
    where: { sessionId },
    orderBy: { order: "desc" },
  })

  const nextOrder = lastQuestion ? lastQuestion.order + 1 : 1

  return prisma.question.create({
    data: {
      sessionId,
      type: "MULTIPLE_CHOICE",
      content: content.trim(),
      order: nextOrder,
      options: {
        create: options.map(o => ({
          content: o.content.trim(),
          isCorrect: o.isCorrect,
        })),
      },
    },
    include: {
      options: true,
    },
  })
}

export async function getQuestionsBySessionAction(sessionId: string) {
  await assertOwner(sessionId)

  return prisma.question.findMany({
    where: { sessionId },
    orderBy: { order: "asc" },
    include: {
      options: true,
    },
  })
}

export async function deleteQuestionAction(questionId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  })

  if (!question) {
    throw new Error("Question not found")
  }

  await assertOwner(question.sessionId)

  return prisma.question.delete({
    where: { id: questionId },
  })
}