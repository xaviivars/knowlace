import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url)
  const questionId = searchParams.get("questionId")

  if (!questionId) {
    return NextResponse.json(
      { error: "Missing questionId" },
      { status: 400 }
    )
  }

  const question = await prisma.question.findUnique({ 
    where: { id: questionId }, 
    include: {
      options: true,
      answers: {
        include: {
          participant: true,
        },
      },
    },
  })

  if (!question) {
    return NextResponse.json(
      { error: "Question not found" },
      { status: 404 }
    )
  }
  
  const totalParticipants = await prisma.participant.count({
    where: {
      sessionId: question?.sessionId
    }
  })

  const totalAnswers = question.answers.length

  if (question.type === "SHORT_ANSWER") {
    return NextResponse.json({
      questionId,
      totalAnswers,
      correctAnswers: 0,
      percentage: 0,
      optionCounts: {},
      totalParticipants,
      textAnswers: question.answers
        .filter((answer) => answer.textResponse?.trim())
        .map((answer) => ({
          participantName: answer.participant.name,
          textResponse: answer.textResponse!.trim(),
        })),
    })
  }

  const optionCounts: Record<string, number> = {}

  question.options.forEach(opt => {
    optionCounts[opt.id] = 0
  })

  question.answers.forEach(answer => {

    if (!answer.optionId) return

    optionCounts[answer.optionId] =
      (optionCounts[answer.optionId] ?? 0) + 1
  })

  const correctOptions = question.options
    .filter(o => o.isCorrect)
    .map(o => o.id)

  const correctAnswers = question.answers.filter(answer =>
    answer.optionId && correctOptions.includes(answer.optionId)
  ).length

  const percentage =
    totalAnswers === 0
      ? 0
      : Math.round((correctAnswers / totalAnswers) * 100)

  return NextResponse.json({
    questionId,
    totalAnswers,
    correctAnswers,
    percentage,
    optionCounts,
    totalParticipants,
    textAnswers: [],
  })
}