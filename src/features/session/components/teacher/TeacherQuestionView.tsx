"use client"

import { QuestionWithOptions } from "@/features/question/question.types"
import {
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline"

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
  
  const showTimer =
    isActive && remainingTime !== null && remainingTime !== undefined

  const participationPercentage =
    stats && stats.totalParticipants > 0
      ? Math.round((stats.totalAnswers / stats.totalParticipants) * 100)
      : 0

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0b162c] px-6 py-8 text-white">
      <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-8 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 flex h-full w-full max-w-5xl flex-col justify-center">
        {(showTimer || stats) && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            {showTimer ? (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/7 px-4 py-2.5 shadow-lg shadow-black/10 backdrop-blur">
                <ClockIcon className="h-5 w-5 text-blue-300" />

                <span className="text-sm font-medium text-white/55">
                  Tiempo restante
                </span>

                <span
                  className={`font-mono text-xl font-black ${
                    remainingTime <= 5 ? "text-red-300" : "text-white"
                  }`}
                >
                  {remainingTime}s
                </span>
              </div>
            ) : (
              <div />
            )}

            {stats && (
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/7 px-4 py-2.5 shadow-lg shadow-black/10 backdrop-blur">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-cyan-300" />

                <div>
                  <p className="text-sm font-medium text-white/55">
                    Respuestas recibidas
                  </p>

                  <p className="font-mono text-lg font-black text-white">
                    {stats.totalAnswers}/{stats.totalParticipants}
                    <span className="ml-2 text-sm font-semibold text-white/35">
                      {participationPercentage}%
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-[#142544]/75 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
              Pregunta
            </p>

            <h2 className="text-4xl font-black leading-tight tracking-tight text-white">
              {question.content}
            </h2>

            {question.type === "SHORT_ANSWER" && (
              <p className="mt-4 text-white/55">
                Los estudiantes responderán con una respuesta breve.
              </p>
            )}
          </div>

          <div className="mt-10">
            {question.type === "SHORT_ANSWER" ? (
              <div className="mx-auto max-w-2xl">
                <div className="rounded-3xl border border-dashed border-white/15 bg-black/15 px-8 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-200">
                    <PencilSquareIcon className="h-7 w-7" />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Respuesta abierta
                  </h3>

                  <p className="mt-2 text-sm text-white/45">
                    Las respuestas aparecerán cuando finalice la pregunta.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {question.options.map((option, index) => (
                  <div
                    key={option.id}
                    className="group flex min-h-24 items-center gap-4 rounded-2xl border border-white/10 bg-white/4 p-5 shadow-lg shadow-black/10 backdrop-blur transition hover:border-white/15 hover:bg-white/6"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-sm font-black text-blue-200 ring-1 ring-blue-300/10">
                      {String.fromCharCode(65 + index)}
                    </div>

                    <p className="min-w-0 flex-1 wrap-break-word text-lg font-semibold leading-snug text-white/90">
                      {option.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isActive && stats && (
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-500"
              style={{
                width: `${participationPercentage}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}