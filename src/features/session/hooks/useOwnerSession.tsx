"use client"

import { useEffect, useState } from "react"
import { getSocket } from "@/lib/socket"

export function useOwnerSession(accessCode: string) {

  const socket = getSocket()

  const [countdown, setCountdown] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {

    socket.emit("owner-join", accessCode)

    socket.on("slide-updated", (index: number) => {
      setSlideIndex(index)
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

    socket.on("question-started", ({ timeLimit, startedAt }) => {

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

      setRemainingTime(null)

    })

    socket.on("question-stats-updated", (data) => {

    })

    socket.on("question-reset", () => {

      setRemainingTime(null)

    })

    return () => {
      
      socket.off("slide-updated")
      socket.off("question-started")
      socket.off("question-ended")
      socket.off("question-countdown")
      socket.off("question-stats-updated")
      socket.off("question-reset")

    }

  }, [accessCode])

  return {
    socket,
    countdown,
    remainingTime,
    slideIndex,
    setSlideIndex
  }

}