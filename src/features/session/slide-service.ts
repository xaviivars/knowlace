import { prisma } from "@/lib/prisma"
import { QuestionType } from "@prisma/client"

export async function createQuestionWithSlide({
  sessionId,
  content,
  type,
  options,
  insertAt,
}: {
  sessionId: string
  content: string
  type: QuestionType
  options: { content: string; isCorrect: boolean }[]
  insertAt?: number
}) {

  const question = await prisma.question.create({
    data: {
      sessionId,
      content,
      type,
      options: {
        create: options,
      },
    },
  })

  const totalSlides = await prisma.slide.count({
    where: { sessionId },
  })

  let order = totalSlides

  if (insertAt !== undefined) {
    await prisma.slide.updateMany({
      where: {
        sessionId,
        order: { gte: insertAt },
      },
      data: {
        order: { increment: 1 },
      },
    })

    order = insertAt
  }

  await prisma.slide.create({
    data: {
      sessionId,
      order,
      type: "QUESTION",
      questionId: question.id,
    },
  })

  return question
}