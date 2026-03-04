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

type OptionStat = {
  optionId: string
  content: string
  count: number
  isCorrect: boolean
}

type Props = {
  question: {
    content: string
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
  }
  onRelaunch?: () => void
}

export default function QuestionResultsView({ question, stats, onRelaunch}: Props) {
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

      <div className="w-full max-w-3xl">
        <Bar data={data} />
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