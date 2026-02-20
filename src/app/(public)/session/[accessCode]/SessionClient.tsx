"use client"

import { useEffect, useState } from "react"
import { getSocket } from "@/lib/socket"

export default function SessionClient({
  accessCode,
  initialIsActive,
}: {
  accessCode: string
  initialIsActive: boolean
}) {
  const [isActive, setIsActive] = useState(initialIsActive)
  const [participants, setParticipants] = useState(0)

  useEffect(() => {
  const socket = getSocket()

  //debug
  ;(window as any).socket = socket

  const handleConnect = () => {
    console.log("Conectado:", socket.id)
    socket.emit("join-session", accessCode)
  }

  socket.on("connect", handleConnect)

  socket.on("session-started", () => {
    setIsActive(true)
  })

  socket.on("participants-count", (count: number) => {
    console.log("Nuevo count:", count)
    setParticipants(count)
  })

  return () => {
    socket.off("connect", handleConnect)
    socket.off("session-started")
    socket.off("participants-count")
  }
    }, [accessCode])

  return (
    <>
      <div className="text-sm text-white/40 mb-4">
        Participantes conectados: {participants}
      </div>

      {!isActive ? (
        <div className="text-white/50 text-sm">
          Esperando a que el profesor inicie la sesión...
        </div>
      ) : (
        <div className="text-green-400 font-semibold">
          La sesión ha comenzado 🎉
        </div>
      )}
    </>
  )
}