"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

type CreateQuestionInput = {
  sessionId: string
  content: string
  pageNumber: number
  options: {
    content: string
    isCorrect: boolean
  }[]
}

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

export async function createQuestionAction({
  sessionId,
  content,
  pageNumber,
  options,
}: CreateQuestionInput) {

  if (!content.trim()) {
    throw new Error("La pregunta no puede estar vacía")
  }

  if (pageNumber < 1) {
    throw new Error("Número de página inválido")
  }

  if (!options.some((o) => o.isCorrect)) {
    throw new Error("Debe haber una opción correcta")
  }

  try {
    return await prisma.question.create({
      data: {
        sessionId,
        content,
        pageNumber,
        type: "MULTIPLE_CHOICE",
        options: {
          create: options.map((opt) => ({
            content: opt.content,
            isCorrect: opt.isCorrect,
          })),
        },
      },
    })
  } catch (error: any) {

    if (error.code === "P2002") {
      throw new Error("Ya existe una pregunta para esa página")
    }

    throw new Error("No se pudo crear la pregunta")
  }
}

export async function getQuestionsBySessionAction(sessionId: string) {
  await assertOwner(sessionId)

  return prisma.question.findMany({
    where: { sessionId },
    orderBy: { pageNumber: "asc" },
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