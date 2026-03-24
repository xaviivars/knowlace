"use client"

import PresentationArea from "@/features/session/components/student/PresentationArea"
import Sidebar from "@/features/session/components/Sidebar"
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

  slides: any[]
  slideIndex: number
  onSlideChange: (i: number) => void

  participantId: string | null
  remainingTime: number | null

  stats: QuestionStats | null
  countdown: number | null

  isFollowingTeacher: boolean
  teacherSlideIndex: number

  refetchStats: () => void
  pdfUrl: String
}

export default function SessionLayout(props: Props) {
  
  const {
    sessionTitle,
    isFollowingTeacher,
    teacherSlideIndex,
    onSlideChange,
    onGoHome, 
    countdown, 
    participants,
    leaderboard,
    joined,
    isActive,
    name,
    setName,
    error,
    onJoin,
    onLeave,
    accessCode,
    slides,
    slideIndex,
    participantId,
    remainingTime,
    stats,
    refetchStats,
    pdfUrl
  } = props

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
              Profesor está en página {teacherSlideIndex}
            </span>
            <button
              onClick={() => onSlideChange(teacherSlideIndex)}
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
          slides={slides}
          slideIndex={slideIndex}
          onSlideChange={onSlideChange}

          participantId={participantId}
          remainingTime={remainingTime}
          countdown={countdown}

          stats={stats}
          refetchStats={refetchStats}
          pdfUrl={pdfUrl}
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