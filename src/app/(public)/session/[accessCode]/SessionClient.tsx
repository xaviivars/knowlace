"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getSocket } from "@/lib/socket"
import { joinSession, reconnectParticipant, leaveParticipant } from "@/lib/actions/session-actions"
import { useRef } from "react"
import PresentationArea from "@/components/session/PresentationArea"
import Sidebar from "@/components/session/Sidebar"
import Link from "next/link"

type Participant = {
  id: string
  name: string
}

export default function SessionClient({
  sessionTitle,
  accessCode,
  initialIsActive,
  initialParticipants,
  initialPage
}: {
  sessionTitle: string
  accessCode: string
  initialIsActive: boolean
  initialParticipants: Participant[]
  initialPage: number
}) {
  const [isActive, setIsActive] = useState(initialIsActive)
  const [participants, setParticipants] = useState(initialParticipants)
  const [name, setName] = useState("")
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const participantIdRef = useRef<string | null>(null)
  const [teacherPage, setTeacherPage] = useState(initialPage)
  const [localPage, setLocalPage] = useState(initialPage)
  const isFollowingTeacher = localPage === teacherPage

  useEffect(() => {

    // Commented for dev
    /*
    const stored = localStorage.getItem("knowlace_participant")

    if (stored) {
      const parsed = JSON.parse(stored)

      if (parsed.accessCode === accessCode) {
        reconnectParticipant(parsed.participantId).then((participant) => {
          if (participant) {
            setName(parsed.name)
            setJoined(true)

            const socket = getSocket()
            socket.emit("participant-joined", accessCode, parsed.participantId)
          }
        })
      }
    }
    */

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

    socket.on("page-updated", (newPage: number) => {
      setTeacherPage(prevTeacher => {
        setLocalPage(prevLocal => {
          if (prevLocal === prevTeacher) {
            return newPage
          }
          return prevLocal
        })

        return newPage
      })
    })

    return () => {
      socket.off("participants-list")
      socket.off("session-started")
      socket.off("session-ended")
      socket.off("connect")
      socket.off("page-updated")
    }
  }, [accessCode])  

  const handleJoin = async () => {
    try {
      setError(null)

      const result = await joinSession(accessCode, name)

      // Commented for dev
      /*
      localStorage.setItem(
        "knowlace_participant",
        JSON.stringify({
          participantId: result.participantId,
          accessCode,
          name,
        })
      )
      */
      
      const socket = getSocket()

      socket.emit("participant-joined", accessCode, result.participantId)

      participantIdRef.current = result.participantId

      setJoined(true)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleLeave = async () => {
    // Como estamos en dev, no usamos storage
    // Necesitamos saber el participantId desde el socket
    if (!participantIdRef.current) return

    await leaveParticipant(participantIdRef.current)

    const socket = getSocket()
    
    socket.emit("participant-left", accessCode)

    participantIdRef.current = null
    setName("")
    setJoined(false)
  }

  const handleGoHome = async () => {
    if (participantIdRef.current) {
      await leaveParticipant(participantIdRef.current)

      const socket = getSocket()
      socket.emit("participant-left", accessCode)

      participantIdRef.current = null
    }

    router.push("/")
  }

  const handlePageChange = (newPage: number) => {
    setLocalPage(newPage)
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0e1d38] text-white">

      <header className="w-full h-18 border-b border-white/30 bg-[#0e1d38]">
        <div className="max-w-6xl px-6 h-full flex items-center">
          <button onClick={handleGoHome}>
            <h1 className="text-2xl font-bold text-white cursor-pointer">
              Knowlace.
            </h1>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {!isFollowingTeacher && (
          <div className="absolute top-20 left-6 bg-yellow-500 text-black px-4 py-2 rounded shadow-lg z-20">
            <span className="mr-3">
              Profesor está en página {teacherPage}
            </span>
            <button
              onClick={() => {
                setLocalPage(teacherPage)
              }}
              className="bg-black text-white px-3 py-1 rounded"
            >
              Seguir al profesor
            </button>
          </div>
        )}

        <PresentationArea
          joined={joined}
          isActive={isActive}
          name={name}
          setName={setName}
          error={error}
          onJoin={handleJoin}

          accessCode={accessCode}
          pageNumber={localPage}
          onPageChange={handlePageChange}
        />

        <Sidebar
          sessionTitle={sessionTitle}
          participants={participants}
          joined={joined}
          isActive={isActive}
          onLeave={handleLeave}
        />

      </div>
    </div>
  )
}