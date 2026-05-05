"use client"

import SessionControls from "@/features/session/components/teacher/SessionControls"
import OwnerSessionPresentation from "@/features/session/components/teacher/OwnerSessionPresentation"
import { Slide } from "@/features/session/session.types"
import { QuestionWithOptions, QuestionStats } from "@/features/question/question.types"
import { OwnerSidebar } from "@/features/session/components/teacher/OwnerSidebar"
  
type Props = {
  sessionId: string
  accessCode: string
  title: string
  description: string | null
  isActive: boolean
  currentSlide: Slide | undefined
  currentQuestion: QuestionWithOptions | null
  slideIndex: number
  slides: Slide[]
  pdfUrl: string
  countdown: number | null
  participants: any[]
  leaderboard: any[]
  remainingTime: number | null
  stats: QuestionStats | null
  currentPageNumber: number
  totalPdfPages: number
  onSlideChange: (index: number) => void
  onLaunchQuestion: () => void
  onEndQuestion: () => void
  onRelaunchQuestion: () => void
}

export default function OwnerSessionLayout({
  sessionId,
  accessCode,
  title,
  description,
  isActive,
  currentSlide,
  currentQuestion,
  slideIndex,
  slides,
  pdfUrl,
  countdown,
  participants,
  leaderboard,
  remainingTime,
  stats,
  currentPageNumber,
  totalPdfPages,
  onSlideChange,
  onLaunchQuestion,
  onEndQuestion,
  onRelaunchQuestion
}: Props) {

  return (
    <div className="flex flex-col h-full w-full bg-[#0e1d38] text-white">

      <header className="border-b border-white/20 px-6 py-4">
        <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
          <p className="text-white/60">{description}</p>
          )}
      </header>

      <div className="border-b border-white/10 px-8 py-4">
        <SessionControls
          sessionId={sessionId}
          accessCode={accessCode}
          initialIsActive={isActive}
        />
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden">
          <OwnerSessionPresentation
            sessionId={sessionId}
            currentSlide={currentSlide}
            currentQuestion={currentQuestion}
            slideIndex={slideIndex}
            slides={slides}
            pdfUrl={pdfUrl}
            countdown={countdown}
            remainingTime={remainingTime}
            stats={stats}
            currentPageNumber={currentPageNumber}
            totalPdfPages={totalPdfPages}
            onSlideChange={onSlideChange}
            onLaunchQuestion={onLaunchQuestion}
            onEndQuestion={onEndQuestion}
            onRelaunchQuestion={onRelaunchQuestion}
          />
        </div>

        <OwnerSidebar
          sessionTitle={title}
          accessCode={accessCode}
          isActive={isActive}
          participants={participants}
          leaderboard={leaderboard}
        />
      </div>
    </div>
  )
}