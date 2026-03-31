"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import OwnerSessionLayout from "@/features/session/owner-session.layout"
import { useOwnerSession } from "@/features/session/hooks/useOwnerSession"
import { useQuestionStats } from "@/features/session/hooks/useQuestionStats"
import { Slide } from "../session.types"

type Props = {
  sessionId: string
  accessCode: string
  title: string
  description: string | null
  initialIsActive: boolean
  initialSlideIndex: number
  slides: Slide[]
  pdfUrl: string
}

export default function OwnerSessionContainer({
  sessionId,
  accessCode,
  title,
  description,
  initialIsActive,
  initialSlideIndex,
  slides,
  pdfUrl
}: Props) {

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
  }, [socket, currentQuestion?.id, refetchStats, router])

  function handleSlideChange(index: number) {
    if (index < 0 || index >= slides.length) return
    setSlideIndex(index)
    socket.emit("slide-changed", index)
  }

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

  return (
    <OwnerSessionLayout
      sessionId={sessionId}
      accessCode={accessCode}
      title={title}
      description={description}
      isActive={initialIsActive}
      currentSlide={currentSlide}
      currentQuestion={currentQuestion}
      slideIndex={slideIndex}
      slides={slides}
      pdfUrl={pdfUrl}
      countdown={countdown}
      remainingTime={remainingTime}
      stats={stats}
      currentPageNumber={getCurrentPageNumber()}
      totalPdfPages={getTotalPdfPages()}
      onSlideChange={handleSlideChange}
      onLaunchQuestion={() => socket.emit("launch-question")}
      onEndQuestion={() => socket.emit("end-question")}
      onRelaunchQuestion={() => socket.emit("relaunch-question")}
    />
  )
}