"use client"

import PresentationArea from "@/components/session/student/PresentationArea"
import Sidebar from "@/components/session/Sidebar"
import { QuestionWithOptions, QuestionStats } from "@/features/question/question.types"
import { Participant } from "@/features/participant/participant.types"

type Props = {
  sessionTitle: string

  participants: Participant[]
  leaderboard: Participant[]

  joined: boolean
  isActive: boolean

  name: string
  setName: (value: string) => void
  error: string | null

  onJoin: () => void
  onLeave: () => void
  onGoHome: () => void

  accessCode: string

  pageNumber: number
  onPageChange: (page: number) => void

  questions: QuestionWithOptions[]

  participantId: string | null
  remainingTime: number | null

  stats: QuestionStats | null

  countdown: number | null

  isFollowingTeacher: boolean
  teacherPage: number

  refetchStats: () => void
}

export default function SessionLayout({
  sessionTitle,
  participants,
  leaderboard,
  joined,
  isActive,

  name,
  setName,
  error,

  onJoin,
  onLeave,
  onGoHome,

  accessCode,

  pageNumber,
  onPageChange,

  questions,

  participantId,
  remainingTime,
  stats,

  countdown,

  isFollowingTeacher,
  teacherPage,
  refetchStats
}: Props) {

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0e1d38] text-white">

      {/* HEADER */}

      <header className="w-full h-18 border-b border-white/30 bg-[#0e1d38]">
        <div className="max-w-6xl px-6 h-full flex items-center">
          <button onClick={onGoHome}>
            <h1 className="text-2xl font-bold text-white cursor-pointer">
              Knowlace.
            </h1>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* FOLLOW TEACHER BANNER */}

        {!isFollowingTeacher && (
          <div className="absolute top-20 left-6 bg-yellow-500 text-black px-4 py-2 rounded shadow-lg z-20">
            <span className="mr-3">
              Profesor está en página {teacherPage}
            </span>
            <button
              onClick={() => onPageChange(teacherPage)}
              className="bg-black text-white px-3 py-1 rounded"
            >
              Seguir al profesor
            </button>
          </div>
        )}

        {/* COUNTDOWN OVERLAY */}

        {countdown !== null && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="text-8xl font-bold text-white animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        <PresentationArea
          joined={joined}
          isActive={isActive}

          name={name}
          setName={setName}
          error={error}
          onJoin={onJoin}

          accessCode={accessCode}
          pageNumber={pageNumber}
          onPageChange={onPageChange}

          questions={questions}

          participantId={participantId}
          remainingTime={remainingTime}

          stats={stats}
          refetchStats={refetchStats}
        />

        <Sidebar
          sessionTitle={sessionTitle}
          participants={participants}
          leaderboard={leaderboard}
          joined={joined}
          isActive={isActive}
          onLeave={onLeave}
        />

      </div>
    </div>
  )
}