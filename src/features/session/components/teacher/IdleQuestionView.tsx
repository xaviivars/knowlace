"use client"

import { QuestionView } from "@/features/session/components/teacher/QuestionView"
import { QuestionWithOptions } from "@/features/question/question.types"

type Props = {
  question: QuestionWithOptions
  pageNumber: number
  isOwner: boolean
  onNext: () => void
  onPrevious: () => void
  onLaunch: () => void
}

export default function IdleQuestionView({
  question,
  pageNumber,
  isOwner,
  onNext,
  onPrevious,
  onLaunch
}: Props) {

  return (
    <div className="relative h-full w-full">

      <div className="h-full">
        <QuestionView
          question={question}
          isOwner={isOwner}
          isActive={false}
        />
      </div>

      <div className="absolute bottom-8 right-8 flex gap-4">

        {pageNumber > 1 && (
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

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={onLaunch}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold"
        >
          Lanzar pregunta
        </button>
      </div>

    </div>
  )

}