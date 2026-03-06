"use client"

import QuestionResultsView from "@/components/session/QuestionResultsView"
import { QuestionWithOptions, QuestionStats } from "@/features/question/question.types"

type Props = {
  question: QuestionWithOptions
  stats: QuestionStats
}

export default function StudentResultsView({
  question,
  stats
}: Props) {

  return (
    <QuestionResultsView
      question={question}
      stats={stats}
    />
  )

}