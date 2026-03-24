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
                <div className="text-white text-center py-10">
                  Esperando a que empiece la pregunta...
                </div>
              )}
            </>
          )}
        </>
      )}

      {joined && isActive && currentSlide && (

      <div className="absolute bottom-6 right-6 flex gap-4 z-20">

        {slideIndex > 0 && (
          <button
            onClick={() => onSlideChange(slideIndex - 1)}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl font-semibold"
          >
            Anterior
          </button>
        )}

        <button
          onClick={() => onSlideChange(Math.min(slideIndex + 1, slides.length - 1))}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
        >
          Siguiente
        </button>

      </div>

    )}
    </div>
  )
}