"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import IdleQuestionView from "@/features/session/components/teacher/IdleQuestionView"
import ActiveQuestionView from "@/features/session/components/teacher/ActiveQuestionView"
import ResultsQuestionView from "@/features/session/components/teacher/ResultsQuestionView"
import CountdownOverlay from "@/features/session/components/CountdownOverlay"
import { Slide } from "@/features/session/session.types"
import { QuestionWithOptions, QuestionStats } from "@/features/question/question.types"
import PresentationToolbar from "@/features/session/components/PresentationToolbar"
import { usePdfZoom } from "@/features/session/hooks/usePdfZoom"
import { useFullscreen } from "@/features/session/hooks/useFullscreen"

const PdfViewer = dynamic(() => import("@/features/session/components/PdfViewer"), { ssr: false })

type Props = {
  sessionId: string
  currentSlide: Slide | undefined
  currentQuestion: QuestionWithOptions | null
  slideIndex: number
  slides: Slide[]
  pdfUrl: string
  countdown: number | null
  remainingTime: number | null
  stats: QuestionStats | null
  currentPageNumber: number
  totalPdfPages: number
  onSlideChange: (index: number) => void
  onLaunchQuestion: () => void
  onEndQuestion: () => void
  onRelaunchQuestion: () => void
}

export default function OwnerSessionPresentation({
  sessionId,
  currentSlide,
  currentQuestion,
  slideIndex,
  slides,
  pdfUrl,
  countdown,
  remainingTime,
  stats,
  currentPageNumber,
  totalPdfPages,
  onSlideChange,
  onLaunchQuestion,
  onEndQuestion,
  onRelaunchQuestion
}: Props) {

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
    if (wasFullscreen.current !== isFullscreen) {
      resetZoom()
    }

    wasFullscreen.current = isFullscreen
  }, [isFullscreen, resetZoom])

  function renderContent() {

    if (!currentSlide) return null

    if (currentSlide.type === "PDF" ) {
      return (
        <PdfViewer
          pdfUrl={pdfUrl}
          pageNumber={currentSlide.page}
          scale={scale}
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
            isOwner={true}
            stats={stats ?? undefined}
            onEnd={onEndQuestion}
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
            onNext={() => onSlideChange(slideIndex + 1)}
            onPrevious={() => onSlideChange(slideIndex - 1)}
            onRelaunch={onRelaunchQuestion}
            hasPrevious={slideIndex > 0}
          />
        )

      default:
        return (
          <IdleQuestionView
            question={question}
            isOwner={true}
            onNext={() => onSlideChange(slideIndex + 1)}
            onPrevious={() => onSlideChange(slideIndex - 1)}
            onLaunch={onLaunchQuestion}
            hasPrevious={slideIndex > 0}
          />
        )
    }

  }

  return (
    <div
      ref={presentationRef}
      className="flex h-full w-full flex-col bg-[#0b162c]"
    >
      <PresentationToolbar
        currentPageNumber={currentPageNumber}
        totalPdfPages={totalPdfPages}
        canGoPrevious={slideIndex > 0}
        canGoNext={slideIndex < slides.length - 1}
        onPrevious={() => onSlideChange(slideIndex - 1)}
        onNext={() => onSlideChange(slideIndex + 1)}
        showZoomControls={currentSlide?.type === "PDF"}
        zoomPercentage={zoomPercentage}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => toggleFullscreen(presentationRef.current)}
      />

      <div className="min-h-0 flex-1">
        {renderContent()}
      </div>
      
    </div>
  )
}

