"use client"

import JoinSessionView from "@/features/session/components/student/JoinSessionView"
import WaitingRoomView from "@/features/session/components/student/WaitingRoomView"
import StudentQuestionView from "@/features/session/components/student/StudentQuestionView"
import StudentResultsView from "@/features/session/components/student/StudentResultsView"
import StudentPdfView from "@/features/session/components/student/StudentPdfView"
import { QuestionWithOptions, QuestionStats } from "@/features/question/question.types"
import { useMemo, useEffect } from "react"
import CountdownOverlay from "../CountdownOverlay"

type Props = {
  joined: boolean
  isActive: boolean

  name: string
  setName: (value: string) => void
  error: string | null
  onJoin: () => void

  accessCode: string

  slides: any[]
  slideIndex: number

  participantId: string | null
  remainingTime: number | null
  countdown: number | null

  stats: QuestionStats | null
  onSlideChange: (index: number) => void
  refetchStats?: () => void
  pdfUrl: string
}

export default function PresentationArea({
  joined,
  isActive,

  name,
  setName,
  error,
  onJoin,

  accessCode,
  
  slides,
  slideIndex,
  onSlideChange,

  participantId,
  remainingTime,
  countdown,

  stats,
  refetchStats,
  pdfUrl
}: Props) {

  const currentSlide = slides[slideIndex]

  const currentQuestion =
    currentSlide?.type === "QUESTION"
      ? currentSlide.question
      : null

  useEffect(() => {

    if (
      currentQuestion?.status === "RESULTS" &&
      currentQuestion?.id &&
      stats?.questionId !== currentQuestion.id
    ) {
      refetchStats?.()
    }
  }, [currentQuestion?.id, currentQuestion?.status, stats?.questionId])

  function getCurrentPageNumber() {
    if (!currentSlide) return 0

    if (currentSlide.type === "PDF") {
      return currentSlide.page
    }

    const prevPdf = [...slides]
      .slice(0, slideIndex)
      .reverse()
      .find((s) => s.type === "PDF")

    return prevPdf?.page ?? 0
  }

  function getTotalPdfPages() {
    return slides.filter((s) => s.type === "PDF").length
  }

  const currentPage = getCurrentPageNumber()
  const totalPages = getTotalPdfPages()

  const canGoPrevious = slideIndex > 0
  const canGoNext = slideIndex < slides.length - 1

  return (
    
    <div className="relative flex flex-col flex-1 bg-[#0b162c]">

      {/* No unido */}

      {!joined && (
        <JoinSessionView
          name={name}
          setName={setName}
          error={error}
          onJoin={onJoin}
        />
      )}

      {/* Unido pero esperando inicio */}

      {joined && !isActive && (
        <WaitingRoomView />
      )}

      {/* Sesión activa */}

      {joined && isActive && currentSlide && (
        <>
          <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-white/15 bg-black/65 px-4 py-2 text-white shadow-lg backdrop-blur-sm">
            <button
              onClick={() => onSlideChange(slideIndex - 1)}
              disabled={!canGoPrevious}
              className="rounded-md bg-white/15 px-3 py-1 text-sm font-medium transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ←
            </button>

            <span className="min-w-35 text-center text-sm font-medium">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => onSlideChange(slideIndex + 1)}
              disabled={!canGoNext}
              className="rounded-md bg-white/15 px-3 py-1 text-sm font-medium transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-30"
            >
              →
            </button>
          </div>

          {/* PDF */}
          {currentSlide.type === "PDF" && (
            <StudentPdfView
              accessCode={accessCode}
              pdfUrl={pdfUrl}
              pageNumber={currentSlide.page}
            />
          )}

          {/* QUESTION */}
          {currentSlide.type === "QUESTION" && currentQuestion && (

            <>
              {currentQuestion.status === "COUNTDOWN" && (
                <CountdownOverlay seconds={countdown ?? 0} />
              )}

              {currentQuestion.status === "ACTIVE" && (
                <StudentQuestionView
                  question={currentQuestion}
                  participantId={participantId}
                  remainingTime={remainingTime}
                />
              )}

              {currentQuestion.status === "RESULTS" && stats && stats?.questionId === currentQuestion.id && (
                <StudentResultsView
                  question={currentQuestion}
                  stats={stats}
                />
              )}

              {currentQuestion.status === "RESULTS" && !stats && (
                <div className="text-white text-center py-10">
                  Cargando resultados...
                </div>
              )}

              {currentQuestion.status === "IDLE" && (
                <div className="flex h-full w-full items-center justify-center bg-[#0b162c] px-6">
                  <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-xl backdrop-blur-sm">
                    <div className="mb-4 text-5xl">🔒</div>
                    <h2 className="mb-3 text-2xl font-bold text-white">
                      Mantente atento
                    </h2>
                    <p className="text-white/75">
                      La siguiente pregunta aún está bloqueada. El profesor la lanzará en breve.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

    </div>
  )
}