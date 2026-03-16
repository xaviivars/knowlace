"use client"

import JoinSessionView from "@/features/session/components/student/JoinSessionView"
import WaitingRoomView from "@/features/session/components/student/WaitingRoomView"
import StudentQuestionView from "@/features/session/components/student/StudentQuestionView"
import StudentResultsView from "@/features/session/components/student/StudentResultsView"
import StudentPdfView from "@/features/session/components/student/StudentPdfView"
import { QuestionWithOptions, QuestionStats } from "@/features/question/question.types"
import { useMemo, useEffect } from "react"

type Props = {
  joined: boolean
  isActive: boolean

  name: string
  setName: (value: string) => void
  error: string | null
  onJoin: () => void

  accessCode: string
  pageNumber: number
  onPageChange: (page: number) => void

  questions: QuestionWithOptions[]

  participantId: string | null
  remainingTime: number | null

  stats: QuestionStats | null
  refetchStats?: () => void
}

export default function PresentationArea({
  joined,
  isActive,

  name,
  setName,
  error,
  onJoin,

  accessCode,
  pageNumber,
  onPageChange,

  questions,

  participantId,
  remainingTime,

  stats,
  refetchStats
}: Props) {

  const questionMap = useMemo(() => {
    return Object.fromEntries(
      questions.map(q => [q.pageNumber, q])
    )
  }, [questions])

  const currentQuestion = questionMap[pageNumber]

  useEffect(() => {

    if (currentQuestion?.status === "RESULTS" && !stats) {
      refetchStats?.()
    }

  }, [currentQuestion?.status, stats, refetchStats])

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

      {joined && isActive && currentQuestion?.status === "ACTIVE" && (
        <StudentQuestionView
          question={currentQuestion}
          participantId={participantId}
          remainingTime={remainingTime}
        />
      )}

      {/* RESULTS */}

      {joined && isActive && currentQuestion?.status === "RESULTS" && stats && (
        <StudentResultsView
          question={currentQuestion}
          stats={stats}
        />
      )}

      {joined && isActive && currentQuestion?.status === "RESULTS" && !stats && (
        <div className="text-white text-center py-10">
          Cargando resultados...
        </div>
      )}

      {/* PDF */}

      {joined && isActive && (!currentQuestion || currentQuestion.status === "IDLE" || currentQuestion.status === "COUNTDOWN") && (

        <>
          <div className="flex-1">

            <StudentPdfView
              accessCode={accessCode}
              pageNumber={pageNumber}
              onPageChange={onPageChange}
            />

          </div>
        </>
      )}
      
      {joined && isActive && (
        <div className="w-full flex justify-end gap-4 px-6 py-6">

              {pageNumber > 1 && (
                <button
                  onClick={() => onPageChange(pageNumber - 1)}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl font-semibold"
                >
                  Anterior
                </button>
              )}

              <button
                onClick={() => onPageChange(pageNumber + 1)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
              >
                Siguiente
              </button>

          </div>
      )}
    </div>
  )
}