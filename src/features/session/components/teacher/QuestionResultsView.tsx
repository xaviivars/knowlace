"use client"

import { ResultStatCard } from "@/features/question/components/ResultStatCard"
import { RelaunchQuestionButton } from "@/features/question/components/RelaunchQuestionButton"

export type FrontQuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"

type Props = {
  question: {
    content: string
    type: FrontQuestionType
    options: {
      id: string
      content: string
      isCorrect: boolean
    }[]
  }
  stats: {
    totalAnswers: number
    correctAnswers: number
    percentage: number
    optionCounts: Record<string, number>
    totalParticipants?: number
    textAnswers?: {
      participantName: string
      textResponse: string
    }[]
  }
  onRelaunch?: () => void
}

export default function QuestionResultsView({ 
  question, 
  stats, 
  onRelaunch
}: Props) {

  if (question.type === "SHORT_ANSWER") {
    return (
      <div className="h-full bg-[#0b162c] text-white flex flex-col items-center justify-center px-6 py-8 space-y-8">
        <h2 className="text-4xl font-bold text-center">
          {question.content}
        </h2>

        <div className="text-center space-y-2">
          <p>
            Respuestas recibidas: {stats.totalAnswers}
            {typeof stats.totalParticipants === "number" && (
              <> / {stats.totalParticipants}</>
            )}
          </p>
        </div>

        <div className="w-full max-w-3xl max-h-96 overflow-y-auto space-y-3">
          {stats.textAnswers && stats.textAnswers.length > 0 ? (
            stats.textAnswers.map((answer, index) => (
              <div
                key={`${answer.participantName}-${index}`}
                className="rounded-2xl bg-white/10 border border-white/10 p-4"
              >
                <p className="text-sm text-white/60 mb-1">
                  {answer.participantName}
                </p>
                <p className="text-white wrap-break-words">
                  {answer.textResponse}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center text-white/60">
              Todavía no hay respuestas.
            </div>
          )}
        </div>

        {onRelaunch && (
          <RelaunchQuestionButton onClick={onRelaunch} />
        )}
      </div>
    )
  }

  return (
    <div className="h-full bg-[#0b162c] text-white flex flex-col items-center justify-center px-6 space-y-8">

      <h2 className="text-4xl font-bold text-center">
        {question.content}
      </h2>

      <OptionResultBars
        options={question.options}
        optionCounts={stats.optionCounts}
        totalAnswers={stats.totalAnswers}
      />

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultStatCard
          label="Respuestas"
          value={
            typeof stats.totalParticipants === "number"
              ? `${stats.totalAnswers}/${stats.totalParticipants}`
              : stats.totalAnswers
          }
          helper="Participación"
        />

        <ResultStatCard
          label="Aciertos"
          value={stats.correctAnswers}
          helper="Respuestas correctas"
          variant={stats.correctAnswers > 0 ? "success" : "default"}
        />

        <ResultStatCard
          label="Precisión"
          value={`${stats.percentage}%`}
          helper="Porcentaje de acierto"
          variant={
            stats.percentage >= 70
              ? "success"
              : stats.percentage >= 40
                ? "warning"
                : "danger"
          }
        />
      </div>

      {onRelaunch && (
        <RelaunchQuestionButton onClick={onRelaunch} />
      )}

    </div>
  )
}

function OptionResultBars({
  options,
  optionCounts,
  totalAnswers,
}: {
  options: {
    id: string
    content: string
    isCorrect: boolean
  }[]
  optionCounts: Record<string, number>
  totalAnswers: number
}) {
  return (
    <div className="w-full max-w-4xl space-y-4">
      {options.map((option, index) => {
        const count = optionCounts[option.id] ?? 0
        const percentage =
          totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0

        return (
          <div
            key={option.id}
            className={`
              overflow-hidden rounded-2xl border p-4 transition
              ${
                option.isCorrect
                  ? "border-emerald-400/30 bg-emerald-500/10"
                  : "border-white/10 bg-white/4"
              }
            `}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={`
                    flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold
                    ${
                      option.isCorrect
                        ? "bg-emerald-400/20 text-emerald-200"
                        : "bg-white/10 text-white/60"
                    }
                  `}
                >
                  {String.fromCharCode(65 + index)}
                </div>

                <div className="min-w-0">
                  <p className="wrap-break-word text-base font-semibold text-white">
                    {option.content}
                  </p>

                  {option.isCorrect && (
                    <p className="mt-1 text-sm font-medium text-emerald-300">
                      Respuesta correcta
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-lg font-black text-white">
                  {percentage}%
                </p>

                <p className="text-xs text-white/45">
                  {count} respuesta{count === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-black/25">
              <div
                className={`
                  h-full rounded-full transition-all duration-700 ease-out
                  ${
                    option.isCorrect
                      ? "bg-emerald-400"
                      : "bg-blue-400/70"
                  }
                `}
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}