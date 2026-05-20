"use client"

import { toggleSession } from "@/features/session/session-actions"
import { getSocket } from "@/lib/socket"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  PencilSquareIcon,
  PlayIcon,
  StopIcon,
} from "@heroicons/react/24/outline"

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
        socket.emit("start-session")
      } else {
        socket.emit("end-session")
      }

      setIsActive(updated.isActive)
      router.refresh();
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/sessions/${sessionId}/edit`}
        title="Editar preguntas"
        aria-label="Editar preguntas"
        className="
          inline-flex h-9 w-9 items-center justify-center rounded-lg
          border border-blue-400/10
          bg-blue-500/10
          text-blue-200/80
          transition
          hover:bg-blue-500/15
          hover:text-blue-100
        "
      >
        <PencilSquareIcon className="h-4 w-4" />
      </Link>

      <button
        type="button"
        onClick={handleStart}
        disabled={isPending}
        title={isActive ? "Terminar sesión" : "Iniciar sesión"}
        aria-label={isActive ? "Terminar sesión" : "Iniciar sesión"}
        className={`
          inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg
          border transition
          disabled:cursor-not-allowed disabled:opacity-30
          ${
            isActive
              ? "border-red-400/10 bg-red-500/10 text-red-200/80 hover:bg-red-500/15 hover:text-red-100"
              : "border-emerald-400/10 bg-emerald-500/10 text-emerald-200/80 hover:bg-emerald-500/15 hover:text-emerald-100"
          }
        `}
      >
        {isActive ? (
          <StopIcon className="h-4 w-4" />
        ) : (
          <PlayIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}