"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"

import { getSocket } from "@/lib/socket"

import { joinSession, reconnectParticipant, leaveParticipant } from "@/features/session/session-actions"

import SessionLayout from "@/features/session/session.layout"

import { QuestionWithOptions } from "@/features/question/question.types"
import { Participant } from "@/features/participant/participant.types"
import { useQuestionStats } from "../hooks/useQuestionStats"

type Slide =
  | { type: "PDF"; page: number }
  | { type: "QUESTION"; question: any }

type Props = {
  sessionTitle: string
  accessCode: string
  initialIsActive: boolean
  initialParticipants: Participant[]
  initialSlideIndex: number
  slides: Slide[]
  pdfUrl: String
}

export default function SessionContainer({
  sessionTitle,
  accessCode,
  initialIsActive,
  initialParticipants,
  initialSlideIndex,
  slides,
  pdfUrl
}: Props) {

  const router = useRouter()

  const [isActive, setIsActive] = useState(initialIsActive)
  const [participants, setParticipants] = useState(initialParticipants)

  const [name, setName] = useState("")
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const participantIdRef = useRef<string | null>(null)

  const [teacherSlideIndex, setTeacherSlideIndex] = useState(initialSlideIndex)
  const [localSlideIndex, setLocalSlideIndex] = useState(initialSlideIndex)

  const isFollowingTeacher = localSlideIndex === teacherSlideIndex

  const [leaderboard, setLeaderboard] = useState<Participant[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const currentSlide = slides[localSlideIndex]
  const currentQuestion =
    currentSlide?.type === "QUESTION"
      ? currentSlide.question
      : null

  const { stats, refetchStats } = useQuestionStats(
    currentQuestion?.id ?? null
  )

  useEffect(() => {

    const socket = getSocket()

    const stored = localStorage.getItem("knowlace_participant")

    if (stored) {

      const parsed = JSON.parse(stored)

      if (parsed.accessCode === accessCode) {

        reconnectParticipant(parsed.participantId).then((participant) => {

          if (participant) {

            setName(parsed.name)
            setJoined(true)

            participantIdRef.current = parsed.participantId

            socket.emit("participant-joined", accessCode, parsed.participantId)

          } else {
            localStorage.removeItem("knowlace_participant")
          }

        })
      }
    }

    if (socket.connected) {

      socket.emit("viewer-join", accessCode)

    } else {

      socket.on("connect", () => {
        socket.emit("viewer-join", accessCode)
      })

    }

    socket.on("participants-list", (list: Participant[]) => {
      setParticipants(list)
    })

    socket.on("session-started", () => {
      setIsActive(true)
    })

    socket.on("session-ended", () => {
      setIsActive(false)
    })

    socket.on("slide-updated", (newIndex: number) => {

      setTeacherSlideIndex(prevTeacher => {

        setLocalSlideIndex(prevLocal => {

          if (prevLocal === prevTeacher) {
            return newIndex
          }

          return prevLocal

        })

        return newIndex

      })

    })

    socket.on("question-started", ({ timeLimit, startedAt }) => {

      router.refresh()

      const start = new Date(startedAt).getTime()
      const end = start + timeLimit * 1000

      const updateTimer = () => {

        const now = Date.now()

        const remaining = Math.max(
          0,
          Math.floor((end - now) / 1000)
        )

        setRemainingTime(remaining)

        if (remaining <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

      }

      updateTimer()

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      intervalRef.current = setInterval(updateTimer, 1000)

    })

    socket.on("question-ended", () => {

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setRemainingTime(null)
      router.refresh()

    })

    socket.on("leaderboard-updated", (data: Participant[]) => {

      setLeaderboard(data)

    })

    socket.on("question-countdown", ({ seconds }) => {

      setCountdown(seconds)

      let current = seconds

      const interval = setInterval(() => {

        current -= 1

        if (current <= 0) {

          clearInterval(interval)
          setCountdown(null)

        } else {

          setCountdown(current)

        }

      }, 1000)

    })

    socket.on("question-stats-updated", () => {
        refetchStats()
    })

    return () => {

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      socket.off("participants-list")
      socket.off("session-started")
      socket.off("session-ended")
      socket.off("connect")
      socket.off("page-updated")
      socket.off("question-started")
      socket.off("question-ended")
      socket.off("leaderboard-updated")
      socket.off("question-countdown")
      socket.off("question-stats-updated")

    }

  }, [accessCode])


  const handleJoin = async () => {

    try {

      setError(null)

      const result = await joinSession(accessCode, name)

      localStorage.setItem(
        "knowlace_participant",
        JSON.stringify({
          participantId: result.participantId,
          accessCode,
          name,
        })
      )

      const socket = getSocket()

      socket.emit("participant-joined", accessCode, result.participantId)

      participantIdRef.current = result.participantId

      setJoined(true)

    } catch (err: any) {

      setError(err.message)

    }

  }

  const handleLeave = async () => {

    localStorage.removeItem("knowlace_participant")

    if (!participantIdRef.current) return

    await leaveParticipant(participantIdRef.current)

    const socket = getSocket()

    socket.emit("participant-left", accessCode)

    participantIdRef.current = null

    setName("")
    setJoined(false)

  }


  const handleGoHome = async () => {

    localStorage.removeItem("knowlace_participant")

    if (participantIdRef.current) {

      await leaveParticipant(participantIdRef.current)

      const socket = getSocket()

      socket.emit("participant-left", accessCode)

      participantIdRef.current = null

    }

    router.push("/")

  }

  const handleSlideChange = (index: number) => {
    if (index < 0 || index >= slides.length) return
    setLocalSlideIndex(index)
  }

  return (

    <SessionLayout
      sessionTitle={sessionTitle}
      participants={participants}
      leaderboard={leaderboard}
      joined={joined}
      isActive={isActive}
      name={name}
      setName={setName}
      error={error}
      onJoin={handleJoin}
      onLeave={handleLeave}
      onGoHome={handleGoHome}
      accessCode={accessCode}
      slides={slides}
      slideIndex={localSlideIndex}
      onSlideChange={handleSlideChange}
      participantId={participantIdRef.current}
      remainingTime={remainingTime}
      stats={stats}
      countdown={countdown}
      isFollowingTeacher={isFollowingTeacher}
      teacherSlideIndex={teacherSlideIndex}
      refetchStats={refetchStats}
      pdfUrl={pdfUrl}
    />

  )

}