"use client"

import { startSession } from "@/lib/actions/session-actions"
import { getSocket } from "@/lib/socket"
import { useTransition } from "react"

export default function SessionControls({
  sessionId,
  accessCode,
}: {
  sessionId: string
  accessCode: string
}) {
  const [isPending, startTransition] = useTransition()

  const handleStart = () => {
    startTransition(async () => {
      await startSession(sessionId)

      const socket = getSocket()
      socket.emit("start-session", accessCode)
    })
  }

  return (
    <button
      onClick={handleStart}
      disabled={isPending}
      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold"
    >
      {isPending ? "Iniciando..." : "Iniciar sesión"}
    </button>
  )
}