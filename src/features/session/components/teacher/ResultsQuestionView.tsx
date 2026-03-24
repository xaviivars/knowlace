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

      <div className="absolute bottom-8 right-8 flex gap-4">

        {hasPrevious && (
          <button
            onClick={onPrevious}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl font-semibold"
          >
            Anterior
          </button>
        )}

        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
        >
          Siguiente
        </button>

      </div>

    </div>
  )

}