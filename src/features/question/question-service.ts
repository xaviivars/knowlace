import { prisma } from "@/lib/prisma"
import { QuestionStatus } from "@prisma/client"

export async function updateQuestionStatus(
  questionId: string,
  status: QuestionStatus
) {
  return prisma.question.update({
    where: { id: questionId },
    data: {
      status
    }
  })
}