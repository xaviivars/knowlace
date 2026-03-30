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
  initialSlideIndex
}: {
  accessCode: string
  slides: Slide[]
  isOwner: boolean
  pdfUrl: string
  initialSlideIndex: number
}) {

  const router = useRouter()

  const {
    socket,
    countdown,
    remainingTime,
    slideIndex,
    setSlideIndex
  } = useOwnerSession(accessCode, initialSlideIndex)

  const currentSlide = slides[slideIndex]

  const currentQuestion =
    currentSlide?.type === "QUESTION"
      ? currentSlide.question
      : null

  const { stats, refetchStats } = useQuestionStats(
    currentQuestion?.id ?? null
  )

  function getCurrentPageNumber() {
    if (!currentSlide) return 0

    if (currentSlide.type === "PDF") {
      return currentSlide.page
    }

    // si estás en pregunta → muestra última página PDF previa
    const prevPdf = [...slides]
      .slice(0, slideIndex)
      .reverse()
      .find(s => s.type === "PDF")

    return prevPdf?.page ?? 0
  }

  function getTotalPdfPages() {
    return slides.filter(s => s.type === "PDF").length;
  }

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
          pdfUrl={pdfUrl}
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
    <div className="relative flex h-full w-full flex-col ">

        <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-white/15 bg-black/65 px-4 py-2 text-white shadow-lg backdrop-blur-sm">

        <button
          onClick={() => handleSlideChange(slideIndex - 1)}
          disabled={slideIndex === 0}
          className="rounded-md bg-white/15 px-3 py-1 text-sm font-medium transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ←
        </button>

        <span className="min-w-35 text-center text-sm font-medium">
          Página {getCurrentPageNumber()} de {getTotalPdfPages()}
        </span>

        <button
          onClick={() => handleSlideChange(slideIndex + 1)}
          disabled={slideIndex >= slides.length - 1}
          className="rounded-md bg-white/15 px-3 py-1 text-sm font-medium transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-30"
        >
          →
        </button>

      </div>

      {renderContent()}
      
    </div>
  )
}

