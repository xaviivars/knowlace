"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

import IdleQuestionView from "@/features/session/components/IdleQuestionView"
import ActiveQuestionView from "@/features/session/components/ActiveQuestionView"
import ResultsQuestionView from "@/features/session/components/ResultsQuestionView"
import CountdownOverlay from "@/features/session/components/CountdownOverlay"

import { useOwnerSession } from "@/features/session/hooks/useOwnerSession"
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

  const {
    socket,
    state,
    countdown,
    remainingTime,
    statsByQuestion
  } = useOwnerSession(accessCode)

  const [pageNumber, setPageNumber] = useState(initialPage)

  const currentQuestion = questions.find(
    q => q.pageNumber === pageNumber
  )

  useEffect(() => {

    socket.on("page-updated", (newPage: number) => {
      setPageNumber(newPage)
    })

    return () => {
      socket.off("page-updated")
    }

  }, [socket])

  function handlePageChange(newPage: number) {
    setPageNumber(newPage)

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
      </div>
    )
}