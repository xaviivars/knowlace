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
  })
  
  const totalParticipants = await prisma.participant.count({
    where: {
      sessionId: question?.sessionId
    }
  })

  const answers = await prisma.answer.findMany({
    where: { questionId }
  })

  const options = await prisma.option.findMany({
    where: { questionId }
  })

  const optionCounts: Record<string, number> = {}

  options.forEach(opt => {
    optionCounts[opt.id] = 0
  })

  answers.forEach(answer => {
    optionCounts[answer.optionId] =
      (optionCounts[answer.optionId] ?? 0) + 1
  })

  const totalAnswers = answers.length

  const correctOptions = options
    .filter(o => o.isCorrect)
    .map(o => o.id)

  const correctAnswers = answers.filter(a =>
    correctOptions.includes(a.optionId)
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
    totalParticipants
  })
}