"use client"

import { QuestionWithOptions } from "@/features/question/question.types"

type TeacherQuestionViewProps = {
  question: QuestionWithOptions
  remainingTime?: number
  isActive?: boolean
  stats?: {
    totalAnswers: number
    totalParticipants: number
  }
}

export function TeacherQuestionView({
  question,
  remainingTime,
  isActive = false,
  stats
}: TeacherQuestionViewProps) {
  return (
    <div className="relative h-full w-full bg-[#0b162c] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-4xl space-y-10">
        {isActive && remainingTime !== null && remainingTime !== undefined && (
          <div className="absolute top-6 left-6 bg-black/40 px-4 py-2 rounded-xl text-lg font-semibold">
            ⏱ {remainingTime}s
          </div>
        )}

        {stats && (
          <div className="absolute top-20 right-6 bg-black/40 px-4 py-2 rounded-xl text-lg font-semibold">
            {stats.totalAnswers} / {stats.totalParticipants}
          </div>
        )}

        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            {question.content}
          </h2>

          {question.type === "SHORT_ANSWER" && (
            <p className="text-white/70">
              Los estudiantes responderán con una respuesta breve.
            </p>
          )}
        </div>

        {question.type === "SHORT_ANSWER" ? (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70">
              Respuesta corta abierta
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {question.options.map((option) => (
              <div
                key={option.id}
                className="p-6 rounded-2xl text-lg font-medium bg-white/10 backdrop-blur-sm cursor-default flex items-center justify-center text-center"
              >
                {option.content}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}