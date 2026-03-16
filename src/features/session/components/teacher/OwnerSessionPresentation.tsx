"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"

import IdleQuestionView from "@/features/session/components/teacher/IdleQuestionView"
import ActiveQuestionView from "@/features/session/components/teacher/ActiveQuestionView"
import ResultsQuestionView from "@/features/session/components/teacher/ResultsQuestionView"
import CountdownOverlay from "@/features/session/components/CountdownOverlay"

import { useOwnerSession } from "@/features/session/hooks/useOwnerSession"
import { QuestionWithOptions } from "@/features/question/question.types"
import { useQuestionStats } from "@/features/session/hooks/useQuestionStats"
import { useRouter } from "next/navigation"

const PdfViewer = dynamic(() => import("@/features/session/components/PdfViewer"), { ssr: false })

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

  const router = useRouter()

  const {
    socket,
    countdown,
    remainingTime,
  } = useOwnerSession(accessCode)

  const [pageNumber, setPageNumber] = useState(initialPage)

  const questionMap = useMemo(() => {
    return Object.fromEntries(
      questions.map(q => [q.pageNumber, q])
    )
  }, [questions])

  const currentQuestion = questionMap[pageNumber]

  const { stats, refetchStats } = useQuestionStats(
    currentQuestion?.id ?? null
  )

  useEffect(() => {

    const handlePageUpdated = (newPage: number) => {
      setPageNumber(newPage)
    }

    const handleStatsUpdated = ({ questionId }: { questionId: string }) => {
      if (questionId === currentQuestion?.id) {
        refetchStats()
      }
    }

    const handleStateChange = () => {
      router.refresh()
    }

    socket.on("page-updated", handlePageUpdated)
    socket.on("question-stats-updated", handleStatsUpdated)

    socket.on("question-started", handleStateChange)
    socket.on("question-ended", handleStateChange)
    socket.on("question-reset", handleStateChange)

    return () => {
      socket.off("page-updated", handlePageUpdated)
      socket.off("question-stats-updated", handleStatsUpdated)

      socket.off("question-started", handleStateChange)
      socket.off("question-ended", handleStateChange)
      socket.off("question-reset", handleStateChange)
    }

  }, [socket, currentQuestion?.id])

  function handlePageChange(newPage: number) {
    setPageNumber(newPage)

    socket.emit("page-changed", newPage)
  }

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

      switch (currentQuestion.status) {

        case "COUNTDOWN":
          return <CountdownOverlay seconds={countdown} />

        case "ACTIVE":
          return (
            <ActiveQuestionView
              question={currentQuestion}
              remainingTime={remainingTime ?? undefined}
              isOwner={isOwner}
              stats={stats ?? undefined}
              onEnd={() => socket.emit("end-question")}
            />
          )

        case "RESULTS":

          if (!stats) {
            return (
              <div className="text-white text-center py-10">
                Cargando resultados...
              </div>
            )
          }
      
          return (
            <ResultsQuestionView
              question={currentQuestion}
              stats={stats}
              pageNumber={pageNumber}
              onNext={() => handlePageChange(pageNumber + 1)}
              onPrevious={() => handlePageChange(pageNumber - 1)}
              onRelaunch={() => socket.emit("relaunch-question")}
            />
          )

        case "IDLE":
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
      <div className="relative flex h-full w-full flex-col justify-center">
        {renderContent()}
      </div>
    )
}