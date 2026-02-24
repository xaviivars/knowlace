"use client"

import { toggleSession } from "@/lib/actions/session-actions"
import { getSocket } from "@/lib/socket"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export default function SessionControls({
  sessionId,
  accessCode,
  initialIsActive,
}: {
  sessionId: string
  accessCode: string
  initialIsActive: boolean
}) {
  const [isActive, setIsActive] = useState(initialIsActive)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStart = () => {
    startTransition(async () => {
      const updated = await toggleSession(sessionId)

      const socket = getSocket()
      
      if (updated.isActive) {
        socket.emit("start-session", accessCode)
      } else {
        socket.emit("end-session", accessCode)
      }

      setIsActive(updated.isActive)
      router.refresh();
    })
  }

  return (
    <button
      onClick={handleStart}
      disabled={isPending}
      className={`px-6 py-3 rounded-xl font-semibold ${
        isActive
          ? "bg-red-600 hover:bg-red-700"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {isPending
        ? "Procesando..."
        : isActive
        ? "Terminar sesión"
        : "Iniciar sesión"}
    </button>
  )
}