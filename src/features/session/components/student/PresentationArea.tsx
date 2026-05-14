"use client"

import JoinSessionView from "@/features/session/components/student/JoinSessionView"
import WaitingRoomView from "@/features/session/components/student/WaitingRoomView"
import StudentQuestionView from "@/features/session/components/student/StudentQuestionView"
import StudentResultsView from "@/features/session/components/student/StudentResultsView"
import StudentPdfView from "@/features/session/components/student/StudentPdfView"
import { QuestionStats } from "@/features/question/question.types"
import { useEffect, useRef } from "react"
import CountdownOverlay from "../CountdownOverlay"
import PresentationToolbar from "@/features/session/components/PresentationToolbar"
import { usePdfZoom } from "@/features/session/hooks/usePdfZoom"
import { useFullscreen } from "@/features/session/hooks/useFullscreen"

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
  pdfUrl,
}: Props) {
  const currentSlide = slides[slideIndex]

  const currentQuestion =
    currentSlide?.type === "QUESTION"
      ? currentSlide.question
      : null

  const {
    scale,
    zoomPercentage,
    zoomIn,
    zoomOut,
    resetZoom,
    canZoomIn,
    canZoomOut,
  } = usePdfZoom()

  const presentationRef = useRef<HTMLDivElement>(null)

  const {
    isFullscreen,
    toggleFullscreen,
  } = useFullscreen<HTMLDivElement>()

  const wasFullscreen = useRef(isFullscreen)

  useEffect(() => {
    if (
      currentQuestion?.status === "RESULTS" &&
      currentQuestion?.id &&
      stats?.questionId !== currentQuestion.id
    ) {
      refetchStats?.()
    }
  }, [currentQuestion?.id, currentQuestion?.status, stats?.questionId, refetchStats])

  useEffect(() => {
    if (wasFullscreen.current !== isFullscreen) {
      resetZoom()
    }

    wasFullscreen.current = isFullscreen
  }, [isFullscreen, resetZoom])

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

  function renderLockedQuestion() {
    return (
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
    )
  }

  function renderResultsQuestion() {
    if (!currentQuestion) return null

    if (!stats || stats.questionId !== currentQuestion.id) {
      return (
        <div className="text-center py-10 text-white">
          Cargando resultados...
        </div>
      )
    }

    return (
      <StudentResultsView
        question={currentQuestion}
        stats={stats}
      />
    )
  }

  function renderQuestionContent() {
    if (!currentQuestion) return null

    switch (currentQuestion.status) {
      case "COUNTDOWN":
        return <CountdownOverlay seconds={countdown ?? 0} />

      case "ACTIVE":
        return (
          <StudentQuestionView
            question={currentQuestion}
            participantId={participantId}
            remainingTime={remainingTime}
          />
        )

      case "RESULTS":
        return renderResultsQuestion()

      case "IDLE":
      default:
        return renderLockedQuestion()
    }
  }

  function renderSlideContent() {
    if (!currentSlide) return null

    if (currentSlide.type === "PDF") {
      return (
        <StudentPdfView
          accessCode={accessCode}
          pdfUrl={pdfUrl}
          pageNumber={currentSlide.page}
          scale={scale}
        />
      )
    }

    if (currentSlide.type === "QUESTION") {
      return renderQuestionContent()
    }

    return null
  }

  const currentPage = getCurrentPageNumber()
  const totalPages = getTotalPdfPages()

  const canGoPrevious = slideIndex > 0
  const canGoNext = slideIndex < slides.length - 1

  return (
    <div
      ref={presentationRef}
      className="relative flex flex-1 flex-col bg-[#0b162c]"
    >
      {!joined && (
        <JoinSessionView
          name={name}
          setName={setName}
          error={error}
          onJoin={onJoin}
        />
      )}

      {joined && !isActive && (
        <WaitingRoomView />
      )}

      {joined && isActive && currentSlide && (
        <>
          <PresentationToolbar
            currentPageNumber={currentPage}
            totalPdfPages={totalPages}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onPrevious={() => onSlideChange(slideIndex - 1)}
            onNext={() => onSlideChange(slideIndex + 1)}
            showZoomControls={currentSlide.type === "PDF"}
            zoomPercentage={zoomPercentage}
            canZoomIn={canZoomIn}
            canZoomOut={canZoomOut}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => toggleFullscreen(presentationRef.current)}
          />

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgb(82_82_91)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
            {renderSlideContent()}
          </div>
        </>
      )}
    </div>
  )
}