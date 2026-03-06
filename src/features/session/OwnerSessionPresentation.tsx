"use client"

import { getSocket } from "@/lib/socket"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import IdleQuestionView from "@/features/session/components/IdleQuestionView"
import ActiveQuestionView from "@/features/session/components/ActiveQuestionView"
import ResultsQuestionView from "@/features/session/components/ResultsQuestionView"
import CountdownOverlay from "@/features/session/components/CountdownOverlay"
import { QuestionWithOptions, QuestionStats } from "@/features/question/question.types"

const PdfViewer = dynamic(() => import("@/components/session/PdfViewer"), { ssr: false })

type QuestionState =
  | "idle"
  | "countdown"
  | "active"
  | "results"

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
  const [state, setState] = useState<QuestionState>("idle")

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)

  const [statsByQuestion, setStatsByQuestion] = useState<
    Record<string, QuestionStats>
  >({})

  const currentQuestion = questions.find(
    q => q.pageNumber === pageNumber
  )

  const socket = getSocket()

  useEffect(() => {

    socket.emit("owner-join", accessCode)

    socket.on("page-updated", (newPage: number) => {
      setPageNumber(newPage)
    })

    socket.on("question-countdown", ({ seconds }) => {

      setCountdown(seconds)
      setState("countdown")

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

    socket.on("question-started", ({ questionId, timeLimit, startedAt }) => {

      setActiveQuestionId(questionId)
      setState("active")

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
      setState("results")
      setActiveQuestionId(null)
      setRemainingTime(null)
    })

    socket.on("question-stats-updated", (data) => {

      setStatsByQuestion(prev => ({
        ...prev,
        [data.questionId]: data
      }))

    })

    socket.on("question-reset", () => {
      setState("idle")
      setActiveQuestionId(null)
      setRemainingTime(null)

      setStatsByQuestion(prev => {
        const copy = { ...prev }
        delete copy[currentQuestion?.id ?? ""]
        return copy
      })
    })

    return () => {
      socket.off("page-updated")
      socket.off("question-started")
      socket.off("question-ended")
      socket.off("question-countdown")
      socket.off("question-stats-updated")
      socket.off("question-reset")
    }
  }, [accessCode])

  const handlePageChange = (newPage: number) => {

    setPageNumber(newPage)

    setState("idle")
    setActiveQuestionId(null)
    setRemainingTime(null)

    const socket = getSocket()
    socket.emit("page-changed", newPage)

  }

  const currentStats = currentQuestion
    ? statsByQuestion[currentQuestion.id]
    : null

  function renderContent() {

      if (!currentQuestion) {

        return (
          <PdfViewer
            accessCode={accessCode}
            pageNumber={pageNumber}
            onPageChange={handlePageChange}
            isOwner
          />
        )

      }

      switch (state) {

        case "countdown":
          return <CountdownOverlay seconds={countdown} />

        case "active":
          return (
            <ActiveQuestionView
              question={currentQuestion}
              remainingTime={remainingTime ?? undefined}
              isOwner={isOwner}
              onEnd={() => socket.emit("end-question")}
            />
          )

        case "results":

          if (!currentStats) {
            return <div className="text-white text-center py-10">Cargando resultados...</div>
          }
      
          return (
            <ResultsQuestionView
              question={currentQuestion}
              stats={currentStats ?? undefined}
              pageNumber={pageNumber}
              onNext={() => handlePageChange(pageNumber + 1)}
              onPrevious={() => handlePageChange(pageNumber - 1)}
              onRelaunch={() => socket.emit("relaunch-question")}
            />
          )

        case "idle":
        default:
          return (
            <IdleQuestionView
              question={currentQuestion}
              pageNumber={pageNumber}
              isOwner={isOwner}
              onNext={() => handlePageChange(pageNumber + 1)}
              onPrevious={() => handlePageChange(pageNumber - 1)}
              onLaunch={() => socket.emit("launch-question")}
            />
          )
      }

    }

    return (
        <div className="relative w-full max-w-7xl flex h-full flex-col">

          {renderContent()}

          {currentQuestion && state === "idle" && (
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

          {currentQuestion && state === "active" && (
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

        </div>
    )
}