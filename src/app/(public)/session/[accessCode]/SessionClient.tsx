"use client"

import { useEffect, useState } from "react"
import { getSocket } from "@/lib/socket"
import { joinSession } from "@/lib/actions/session-actions"

type Participant = {
  id: string
  name: string
}

export default function SessionClient({
  accessCode,
  initialIsActive,
  initialParticipants
}: {
  accessCode: string
  initialIsActive: boolean
  initialParticipants: Participant[]
}) {
  const [isActive, setIsActive] = useState(initialIsActive)
  const [participants, setParticipants] = useState(initialParticipants)
  const [name, setName] = useState("")
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
  const socket = getSocket()

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

  return () => {
    socket.off("participants-list")
    socket.off("session-started")
    socket.off("session-ended")
  }
    }, [accessCode])

  const handleJoin = async () => {
    try {
      setError(null)

      await joinSession(accessCode, name)

      const socket = getSocket()
      socket.emit("participant-joined", accessCode)

      setJoined(true)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-lg font-semibold mb-2">
          Participantes ({participants.length})
        </h2>

        <ul className="space-y-1 text-white/80">
          {participants.map((p) => (
            <li key={p.id}>• {p.name}</li>
          ))}
        </ul>
      </div>

      {!joined && (
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="px-4 py-2 rounded bg-white/10 border border-white/20"
          />

          <button
            onClick={handleJoin}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Unirse
          </button>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
        </div>
      )}

      {joined && !isActive && (
        <div className="text-white/50">
          Esperando a que el profesor inicie la sesión...
        </div>
      )}

      {joined && isActive && (
        <div className="text-green-400 font-semibold">
          La sesión ha comenzado 🎉
        </div>
      )}
    </div>
  )
}