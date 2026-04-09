"use client"

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

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
          <button
            onClick={onRelaunch}
            className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-xl font-semibold"
          >
            Relanzar pregunta
          </button>
        )}
      </div>
    )
  }

  const labels = question.options.map(opt => opt.content)

  const dataValues = question.options.map(opt =>
    stats.optionCounts[opt.id] ?? 0
  )

  const backgroundColors = question.options.map(opt =>
    opt.isCorrect
      ? "rgba(34,197,94,0.8)"   // verde
      : "rgba(239,68,68,0.6)"   // rojo suave
  )

  const data = {
    labels,
    datasets: [
      {
        label: "Respuestas",
        data: dataValues,
        backgroundColor: backgroundColors,
        borderRadius: 8,
      }
    ]
  }

  return (
    <div className="h-full bg-[#0b162c] text-white flex flex-col items-center justify-center px-6 space-y-8">

      <h2 className="text-4xl font-bold text-center">
        {question.content}
      </h2>

      <div className="w-full max-w-3xl h-96">
        <Bar 
          key={`${stats.totalAnswers}-${JSON.stringify(stats.optionCounts)}`}
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: true
          }}
        />
      </div>

      <div className="text-center space-y-2">
        <p>Total respuestas: {stats.totalAnswers}</p>
        <p>Aciertos: {stats.correctAnswers}</p>
        <p>% aciertos: {stats.percentage}%</p>
      </div>

      {onRelaunch && (
        <button
          onClick={onRelaunch}
          className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-xl font-semibold"
        >
          Relanzar pregunta
        </button>
      )}

    </div>
  )
}