"use client"

import { getSocket } from "@/lib/socket"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { QuestionView } from "@/components/session/teacher/QuestionView"

const PdfViewer = dynamic(() => import("../PdfViewer"), { ssr: false })

type QuestionWithOptions = {
  id: string
  content: string
  pageNumber: number
  options: {
    id: string
    content: string
    isCorrect: boolean
  }[]
}

export default function OwnerSessionPresentation({
  accessCode,
  initialPage,
  isOwner,
  questions,
}: {
  accessCode: string
  initialPage: number
  isOwner: boolean
  questions: QuestionWithOptions[]
}) {

  const [pageNumber, setPageNumber] = useState(initialPage)

  const currentQuestion = questions.find(
    q => q.pageNumber === pageNumber
  )

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)

  const [countdown, setCountdown] = useState<number | null>(null)

  const [stats, setStats] = useState<{
    totalAnswers: number
    correctAnswers: number
    percentage: number
  } | null>(null)

  const [remainingTime, setRemainingTime] = useState<number | null>(null)

    useEffect(() => {
      const socket = getSocket()

      socket.emit("owner-join", accessCode)

      socket.on("page-updated", (newPage: number) => {
        setPageNumber(newPage)
      })

      socket.on("question-started", ({ questionId, timeLimit, startedAt }) => {
        setActiveQuestionId(questionId)

        const start = new Date(startedAt).getTime()
        const end = start + timeLimit * 1000

        const updateTimer = () => {
          const now = Date.now()
          const remaining = Math.max(
            0,
            Math.floor((end - now) / 1000)
          )

          setRemainingTime(remaining)

          if (remaining <= 0) {
            clearInterval(interval)
          }
        }

        updateTimer()

        const interval = setInterval(updateTimer, 1000)
      })

      socket.on("question-ended", () => {
        setActiveQuestionId(null)
        setRemainingTime(null)
      })

      socket.on("question-countdown", ({ seconds }) => {
        setCountdown(seconds)

        let current = seconds

        const interval = setInterval(() => {
          current -= 1

          if (current <= 0) {
            clearInterval(interval)
            setCountdown(null)
          } else {
            setCountdown(current)
          }
        }, 1000)
      })

      socket.on("question-stats-updated", (data) => {
        setStats(data)
      })

      return () => {
        socket.off("page-updated")
        socket.off("question-started")
        socket.off("question-ended")
        socket.off("question-countdown")
        socket.off("question-stats-updated")
      }
    }, [accessCode])

    const handlePageChange = (newPage: number) => {
      setPageNumber(newPage)

    const socket = getSocket()
        socket.emit("page-changed", newPage)
    }

  return (
    <div className="flex-1 bg-[#0b162c] relative">

      {currentQuestion && isOwner && activeQuestionId !== currentQuestion.id && countdown === null && (
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => {
              const socket = getSocket()
              socket.emit("launch-question")
            }}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold"
          >
            Lanzar pregunta
          </button>
        </div>
      )}

      {currentQuestion && isOwner && activeQuestionId === currentQuestion.id && (
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => {
              const socket = getSocket()
              socket.emit("end-question")
            }}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold"
          >
            Finalizar pregunta
          </button>
        </div>
      )}

      {countdown !== null && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-8xl font-bold text-white animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {currentQuestion ? (
        <>
        <QuestionView 
          question={currentQuestion} 
          isOwner={isOwner} 
          remainingTime={remainingTime ?? undefined}
          isActive={activeQuestionId === currentQuestion.id}
        />

        <div className="absolute bottom-6 right-6 flex gap-4">
          {pageNumber > 1 && (
            <button
              onClick={() => handlePageChange(pageNumber - 1)}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl font-semibold"
            >
              Anterior
            </button>
          )}

          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
          >
            Siguiente
          </button>
        </div>

        {stats && (
          <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur p-6 rounded-xl">
            <p className="text-sm">Respuestas: {stats.totalAnswers}</p>
            <p className="text-sm">Aciertos: {stats.correctAnswers}</p>
            <p className="text-sm">% Aciertos: {stats.percentage}%</p>
          </div>
        )}
      </>
      ) : (
          <PdfViewer
            accessCode={accessCode}
            pageNumber={pageNumber}
            onPageChange={handlePageChange}
            isOwner={true}
          />
      )}
    </div>
  )
}