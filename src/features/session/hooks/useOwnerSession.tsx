"use client"

import { useEffect, useState } from "react"
import { getSocket } from "@/lib/socket"
import { QuestionStats } from "@/features/question/question.types"

export type QuestionState =
  | "idle"
  | "countdown"
  | "active"
  | "results"

export function useOwnerSession(accessCode: string) {

  const socket = getSocket()

  const [state, setState] = useState<QuestionState>("idle")
  const [countdown, setCountdown] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)

  const [statsByQuestion, setStatsByQuestion] = useState<
    Record<string, QuestionStats>
  >({})

  useEffect(() => {

    socket.emit("owner-join", accessCode)

    socket.on("question-countdown", ({ seconds }) => {

      setCountdown(seconds)
      setState("countdown")

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

    socket.on("question-started", ({ timeLimit, startedAt }) => {

      setState("active")

      const start = new Date(startedAt).getTime()
      const end = start + timeLimit * 1000

      const updateTimer = () => {

        const now = Date.now()

        const remaining = Math.max(
          0,
          Math.floor((end - now) / 1000)
        )

        setRemainingTime(remaining)

        if (remaining <= 0) {
          clearInterval(interval)
        }

      }

      updateTimer()

      const interval = setInterval(updateTimer, 1000)

    })

    socket.on("question-ended", () => {

      setState("results")
      setRemainingTime(null)

    })

    socket.on("question-stats-updated", (data) => {

      setStatsByQuestion(prev => ({
        ...prev,
        [data.questionId]: data
      }))

    })

    socket.on("question-reset", () => {

      setState("idle")
      setRemainingTime(null)

    })

    return () => {

      socket.off("question-started")
      socket.off("question-ended")
      socket.off("question-countdown")
      socket.off("question-stats-updated")
      socket.off("question-reset")

    }

  }, [accessCode])

  return {
    socket,
    state,
    countdown,
    remainingTime,
    statsByQuestion
  }

}