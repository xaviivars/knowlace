"use client"

import { useEffect, useRef, useState } from "react"
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
import { QuestionPodiumOverlay } from "@/features/question/components/QuestionPodiumOverlay"
import { getSessionPodiumAction } from "@/features/session/session-actions"
import { TeacherQuestionView } from "./TeacherQuestionView"

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
  toolbarActions?: React.ReactNode
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
  onRelaunchQuestion,
  toolbarActions,
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

  useEffect(() => {
    const question =
      currentSlide?.type === "QUESTION"
        ? currentSlide.question
        : null

    if (!question) {
      previousQuestionStateRef.current = null
      setShowPodium(false)
      return
    }

    const previous = previousQuestionStateRef.current

    const isAutoScoredQuestion = question.type !== "SHORT_ANSWER"

    const hasJustFinished =
      isAutoScoredQuestion &&
      previous?.id === question.id &&
      previous.status !== "RESULTS" &&
      question.status === "RESULTS"

    previousQuestionStateRef.current = {
      id: question.id,
      status: question.status,
    }

    if (!hasJustFinished) return

    async function loadPodium() {
      try {
        const podiumResult = await getSessionPodiumAction(sessionId)
        setPodium(podiumResult)
        setShowPodium(true)
      } catch (error) {
        console.error(error)
        setPodium([])
        setShowPodium(true)
      }
    }

    loadPodium()
  }, [currentSlide, sessionId])

  function handleGoToPage(page: number) {
    const targetIndex = slides.findIndex(
      (slide) => slide.type === "PDF" && slide.page === page
    )

    if (targetIndex === -1) return

    onSlideChange(targetIndex)
  }

  const [showPodium, setShowPodium] = useState(false)
  const [podium, setPodium] = useState<
    {
      id: string
      name: string
      score?: number
      answerTimeMs?: number
    }[]
  >([])

  const previousQuestionStateRef = useRef<{
    id: string
    status: string
  } | null>(null)

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
        return (
          <TeacherQuestionView
            question={question}
            isActive={false}
          />
        )

      case "ACTIVE":
        return (
          <ActiveQuestionView
            question={question}
            remainingTime={remainingTime ?? undefined}
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
            onLaunch={onLaunchQuestion}
          />
        )
    }

  }

  return (
    <div
      ref={presentationRef}
      className="relative flex h-full w-full flex-col bg-[#0b162c]"
    >
      <PresentationToolbar
        currentPageNumber={currentPageNumber}
        totalPdfPages={totalPdfPages}
        canGoPrevious={slideIndex > 0}
        canGoNext={slideIndex < slides.length - 1}
        onPrevious={() => onSlideChange(slideIndex - 1)}
        onNext={() => onSlideChange(slideIndex + 1)}
        onGoToPage={handleGoToPage}
        showZoomControls={currentSlide?.type === "PDF"}
        zoomPercentage={zoomPercentage}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => toggleFullscreen(presentationRef.current)}
        rightActions={toolbarActions}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin [scrollbar-color:rgb(82_82_91)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
        {renderContent()}
      </div>

      <CountdownOverlay seconds={countdown} />

      {showPodium && stats && (
        <QuestionPodiumOverlay
          podium={podium}
          totalAnswers={stats.totalAnswers}
          correctAnswers={stats.correctAnswers}
          totalParticipants={stats.totalParticipants}
          accuracy={stats.percentage}
          onContinue={() => setShowPodium(false)}
        />
      )}
      
    </div>
  )
}

