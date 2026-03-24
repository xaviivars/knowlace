import { prisma } from "@/lib/prisma"

export async function createQuestionWithSlide({
  sessionId,
  content,
  options,
  insertAt,
}: {
  sessionId: string
  content: string
  options: { content: string; isCorrect: boolean }[]
  insertAt?: number
}) {

  const question = await prisma.question.create({
    data: {
      sessionId,
      content,
      type: "MULTIPLE_CHOICE",
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