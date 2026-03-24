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

type Slide =
  | { type: "PDF"; page: number }
  | { type: "QUESTION"; question: QuestionWithOptions }

export default function OwnerSessionPresentation({
  accessCode,
  slides,
  isOwner,
  pdfUrl,
}: {
  accessCode: string
  slides: Slide[]
  isOwner: boolean
  pdfUrl: string
}) {

  const router = useRouter()

  const {
    socket,
    countdown,
    remainingTime,
    slideIndex,
    setSlideIndex
  } = useOwnerSession(accessCode)

  const currentSlide = slides[slideIndex]

  const currentQuestion =
    currentSlide?.type === "QUESTION"
      ? currentSlide.question
      : null

  const { stats, refetchStats } = useQuestionStats(
    currentQuestion?.id ?? null
  )

  useEffect(() => {

    const handleStatsUpdated = ({ questionId }: { questionId: string }) => {
      if (questionId === currentQuestion?.id) {
        refetchStats()
      }
    }

    const handleStateChange = () => {
      router.refresh()
    }
    socket.on("question-stats-updated", handleStatsUpdated)

    socket.on("question-started", handleStateChange)
    socket.on("question-ended", handleStateChange)
    socket.on("question-reset", handleStateChange)

    return () => {
      socket.off("question-stats-updated", handleStatsUpdated)
      socket.off("question-started", handleStateChange)
      socket.off("question-ended", handleStateChange)
      socket.off("question-reset", handleStateChange)
    }

  }, [socket, currentQuestion?.id])

  function handleSlideChange(index: number) {

    if (index < 0 || index >= slides.length) return

    setSlideIndex(index)
    socket.emit("slide-changed", index)
  }

  function renderContent() {

      if (!currentSlide) return null

      if (currentSlide.type === "PDF" ) {
        return (
          <PdfViewer
            fileUrl={pdfUrl}
            pageNumber={currentSlide.page}
          />
        )
      }

      const question = currentSlide.question
      if (!question) return null

      switch (question.status) {

        case "COUNTDOWN":
          return <CountdownOverlay seconds={countdown ?? 0} />

        case "ACTIVE":
          return (
            <ActiveQuestionView
              question={question}
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
              question={question}
              stats={stats}
              onNext={() => handleSlideChange(slideIndex + 1)}
              onPrevious={() => handleSlideChange(slideIndex - 1)}
              onRelaunch={() => socket.emit("relaunch-question")}
              hasPrevious={slideIndex > 0}
            />
          )

        default:
          return (
            <IdleQuestionView
              question={question}
              isOwner={isOwner}
              onNext={() => handleSlideChange(slideIndex + 1)}
              onPrevious={() => handleSlideChange(slideIndex - 1)}
              onLaunch={() => socket.emit("launch-question")}
              hasPrevious={slideIndex > 0}
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