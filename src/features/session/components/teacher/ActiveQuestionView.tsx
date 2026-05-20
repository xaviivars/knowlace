"use client"

import { TeacherQuestionView } from "@/features/session/components/teacher/TeacherQuestionView"
import { QuestionWithOptions } from "@/features/question/question.types"
import { StopIcon } from "@heroicons/react/24/outline"

type Props = {
  question: QuestionWithOptions
  remainingTime?: number
  stats?: {
    totalAnswers: number
    totalParticipants: number
  }
  onEnd: () => void
}

export default function ActiveQuestionView({
  question,
  remainingTime,
  stats,
  onEnd
}: Props) {

  return (
    <div className="flex h-full w-full flex-col bg-[#0b162c]">
      <div className="min-h-0 flex-1">
      <TeacherQuestionView
        question={question}
        remainingTime={remainingTime}
        isActive
        stats={stats}
      />
      </div>

      <div className="shrink-0 border-t border-white/10 px-6 py-5">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onEnd}
            className="
              group
              inline-flex items-center gap-2
              rounded-xl
              border border-red-300/20
              bg-linear-to-r from-red-400/15 to-rose-300/10
              px-5 py-2.5
              text-sm font-semibold
              text-red-100
              shadow-lg shadow-red-950/10
              transition
              hover:border-red-300/35
              hover:from-red-400/20
              hover:to-rose-300/15
              hover:text-red-50
              hover:shadow-red-500/10
              active:scale-[0.98]
            "
          >
            <StopIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            Finalizar pregunta
          </button>
        </div>
      </div>
    </div>
  )

}