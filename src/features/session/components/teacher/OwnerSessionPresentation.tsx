"use client"

import dynamic from "next/dynamic"
import IdleQuestionView from "@/features/session/components/teacher/IdleQuestionView"
import ActiveQuestionView from "@/features/session/components/teacher/ActiveQuestionView"
import ResultsQuestionView from "@/features/session/components/teacher/ResultsQuestionView"
import CountdownOverlay from "@/features/session/components/CountdownOverlay"
import { Slide } from "@/features/session/session.types"
import { QuestionWithOptions, QuestionStats } from "@/features/question/question.types"

const PdfViewer = dynamic(() => import("@/features/session/components/PdfViewer"), { ssr: false })

type Props = {
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
    <div className="relative flex h-full w-full flex-col ">

        <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-white/15 bg-black/65 px-4 py-2 text-white shadow-lg backdrop-blur-sm">

        <button
          onClick={() => onSlideChange(slideIndex - 1)}
          disabled={slideIndex === 0}
          className="rounded-md bg-white/15 px-3 py-1 text-sm font-medium transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ←
        </button>

        <span className="min-w-35 text-center text-sm font-medium">
          Página {currentPageNumber} de {totalPdfPages}
        </span>

        <button
          onClick={() => onSlideChange(slideIndex + 1)}
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

