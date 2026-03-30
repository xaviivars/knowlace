"use client"

import QuestionResultsView from "@/features/session/components/teacher/QuestionResultsView"
import { QuestionWithOptions, QuestionStats } from "@/features/question/question.types"

type Props = {
  question: QuestionWithOptions
  stats: QuestionStats 
  onNext: () => void
  onPrevious: () => void
  onRelaunch: () => void
  hasPrevious: boolean
}

export default function ResultsQuestionView({
  question,
  stats,
  onNext,
  onPrevious,
  onRelaunch,
  hasPrevious
}: Props) {

  return (
    <div className="relative h-full w-full">

      <QuestionResultsView
        question={question}
        stats={stats}
        onRelaunch={onRelaunch}
      />

    </div>
  )

}