"use client"

import { useEffect, useRef, useState } from "react"
import { getSocket } from "@/lib/socket"

export function useOwnerSession(accessCode: string, initialSlideIndex: number) {

  const socket = getSocket()

  const [countdown, setCountdown] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [slideIndex, setSlideIndex] = useState(initialSlideIndex)

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const remainingTimeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearCountdownInterval() {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }

  function clearRemainingTimeInterval() {
    if (remainingTimeIntervalRef.current) {
      clearInterval(remainingTimeIntervalRef.current)
      remainingTimeIntervalRef.current = null
    }
  }

  useEffect(() => {
    function handleConnect() {
      socket.emit("owner-join", accessCode)
    }

    if (socket.connected) {
      handleConnect()
    }

    socket.on("connect", handleConnect)

    const handleSlideUpdated = (index: number) => {
      setSlideIndex(index)
    }

    const handleQuestionCountdown = ({ seconds }: { seconds: number }) => {
      clearCountdownInterval()
      clearRemainingTimeInterval()

      setRemainingTime(null)
      setCountdown(seconds)

      let current = seconds

      countdownIntervalRef.current = setInterval(() => {
        current -= 1

        if (current <= 0) {
          clearCountdownInterval()
          setCountdown(null)
          return
        }

        setCountdown(current)
      }, 1000)
    }

    const handleQuestionStarted = ({
      timeLimit,
      startedAt,
    }: {
      timeLimit: number
      startedAt: string
    }) => {
      clearCountdownInterval()
      clearRemainingTimeInterval()

      setCountdown(null)

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
          clearRemainingTimeInterval()
        }
      }

      updateTimer()

      remainingTimeIntervalRef.current = setInterval(updateTimer, 1000)
    }

    const handleQuestionEnded = () => {
      clearCountdownInterval()
      clearRemainingTimeInterval()

      setCountdown(null)
      setRemainingTime(null)
    }

    const handleQuestionReset = () => {
      clearCountdownInterval()
      clearRemainingTimeInterval()

      setCountdown(null)
      setRemainingTime(null)
    }

    socket.on("slide-updated", handleSlideUpdated)
    socket.on("question-countdown", handleQuestionCountdown)
    socket.on("question-started", handleQuestionStarted)
    socket.on("question-ended", handleQuestionEnded)
    socket.on("question-reset", handleQuestionReset)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("slide-updated", handleSlideUpdated)
      socket.off("question-countdown", handleQuestionCountdown)
      socket.off("question-started", handleQuestionStarted)
      socket.off("question-ended", handleQuestionEnded)
      socket.off("question-reset", handleQuestionReset)

      clearCountdownInterval()
      clearRemainingTimeInterval()
    }
  }, [socket, accessCode])

  return {
    socket,
    countdown,
    remainingTime,
    slideIndex,
    setSlideIndex,
  }
}