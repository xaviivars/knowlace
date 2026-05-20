"use client"

import { TeacherQuestionView } from "@/features/session/components/teacher/TeacherQuestionView"
import { QuestionWithOptions } from "@/features/question/question.types"
import { RocketLaunchIcon } from "@heroicons/react/24/outline"

type Props = {
  question: QuestionWithOptions
  onLaunch: () => void
}

export default function IdleQuestionView({
  question,
  onLaunch,
}: Props) {

  return (
    <div className="flex h-full w-full flex-col bg-[#0b162c]">
      <div className="min-h-0 flex-1">
        <TeacherQuestionView
          question={question}
          isActive={false}
        />
      </div>

      <div className="shrink-0 border-t border-white/10 px-6 py-5">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLaunch}
            className="
              group
              inline-flex items-center gap-2
              rounded-xl
              border border-emerald-300/20
              bg-linear-to-r from-emerald-400/15 to-green-300/10
              px-5 py-2.5
              text-sm font-semibold
              text-emerald-100
              shadow-lg shadow-emerald-950/10
              transition
              hover:border-emerald-300/35
              hover:from-emerald-400/20
              hover:to-green-300/15
              hover:text-emerald-50
              hover:shadow-emerald-500/10
              active:scale-[0.98]
            "
          >
            <RocketLaunchIcon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            Lanzar pregunta
          </button>
        </div>
      </div>

    </div>
  )

}