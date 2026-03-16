"use client"

import { QuestionView } from "@/features/session/components/teacher/QuestionView"
import { QuestionWithOptions } from "@/features/question/question.types"

type Props = {
  question: QuestionWithOptions
  remainingTime?: number
  isOwner: boolean
  stats?: {
    totalAnswers: number
    totalParticipants: number
  }
  onEnd: () => void
}

export default function ActiveQuestionView({
  question,
  remainingTime,
  isOwner,
  stats,
  onEnd
}: Props) {

  return (
    <>
      <QuestionView
        question={question}
        isOwner={isOwner}
        remainingTime={remainingTime}
        isActive
        stats={stats}
      />

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={onEnd}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold"
        >
          Finalizar pregunta
        </button>
      </div>
    </>
  )

}