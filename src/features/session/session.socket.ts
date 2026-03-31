import { Server, Socket } from "socket.io"
import { prisma } from "@/lib/prisma"
import { getParticipantsByAccessCode, getLeaderboardByAccessCode, getQuestionStats } from "@/features/session/session-service"
import { syncActiveQuestion } from "@/features/session/logic/session.sync"
import { broadcastParticipants } from "./logic/broadcastParticipants"

export function registerSessionSockets(io: Server, socket: Socket) {

  socket.on("owner-join", async (accessCode: string) => {

    const user = socket.data.user
    if (!user) return

    const session = await prisma.teachingSession.findUnique({
      where: { accessCode },
    })

    if (!session) return
    if (session.ownerId !== user.id) return

    socket.join(accessCode)

    socket.data.accessCode = accessCode
    socket.data.role = "owner"

    socket.emit("slide-updated", session.currentPage)

    const participants = await getParticipantsByAccessCode(accessCode)
      if (participants) {
        socket.emit("participants-list", participants)
      }

    const leaderboard = await getLeaderboardByAccessCode(accessCode)
      if (leaderboard) {
        socket.emit("leaderboard-updated", leaderboard)
      }
  })

  socket.on("viewer-join", async (accessCode: string) => {

    const session = await prisma.teachingSession.findUnique({
      where: { accessCode },
    })

    if (!session) return

    const participants = await getParticipantsByAccessCode(accessCode)
    if (!participants) return

    socket.join(accessCode)

    socket.data.role = "viewer"
    socket.data.accessCode = accessCode

    socket.emit("participants-list", participants)

    const leaderboard = await getLeaderboardByAccessCode(accessCode)
    if (leaderboard) {
      socket.emit("leaderboard-updated", leaderboard)
    }

    await syncActiveQuestion(socket, session.id)

  })

  socket.on("participant-joined", async (accessCode: string, participantId: string) => {

    socket.data.participantId = participantId
    socket.data.role = "participant"
    socket.data.accessCode = accessCode

    await prisma.participant.update({
      where: { id: participantId },
      data: {
        lastSeen: new Date(),
        isActive: true
      },
    })

    socket.join(accessCode)

    const session = await prisma.teachingSession.findUnique({
      where: { accessCode },
    })

    if (!session) return

    await broadcastParticipants(io, accessCode)

    const leaderboard = await getLeaderboardByAccessCode(accessCode)

    if (leaderboard) {
      io.to(accessCode).emit("leaderboard-updated", leaderboard)
    }

    await syncActiveQuestion(socket, session.id)

  })

  socket.on("disconnect", async () => {

    if (socket.data.role !== "participant") return

    const { participantId, accessCode } = socket.data
    
    if (!participantId || !accessCode) return

    await prisma.participant.update({
      where: { id: participantId },
      data: { isActive: false },
    })

    await broadcastParticipants(io, accessCode)

    const leaderboard = await getLeaderboardByAccessCode(accessCode)
    if (leaderboard) {
      io.to(accessCode).emit("leaderboard-updated", leaderboard)
    }
   })

  socket.on("start-session", async () => {

    const accessCode = socket.data.accessCode
    if (!accessCode) return
    if (socket.data.role !== "owner") return

    await prisma.teachingSession.update({
        where: { accessCode },
        data: { isActive: true },
    })

    io.to(accessCode).emit("session-started")
    
  })

  socket.on("end-session", async () => {

    const accessCode = socket.data.accessCode
    if (!accessCode) return
    if (socket.data.role !== "owner") return

    await prisma.teachingSession.update({
        where: { accessCode },
        data: { isActive: false },
    })

    io.to(accessCode).emit("session-ended")

  })

  socket.on("slide-changed", async (newIndex: number) => {

    const accessCode = socket.data.accessCode

    if (!accessCode) return
    if (socket.data.role !== "owner") return
    if (typeof newIndex !== "number") return
    if (newIndex < 0) return

    const session = await prisma.teachingSession.findUnique({
      where: { accessCode },
    })

    if (!session) return

    await prisma.teachingSession.update({
        where: { accessCode },
        data: { currentPage: newIndex },
    })

    const slide = await prisma.slide.findFirst({
      where: {
        sessionId: session.id,
        order: newIndex,
      },
      include: {
        question: true,
      }
    })

    if (slide?.type === "QUESTION" && slide.question?.endedAt) {
      io.to(accessCode).emit("question-stats-updated", {
        questionId: slide.question.id,
      })
    }

    io.to(accessCode).emit("slide-updated", newIndex)
    
  })
  
  socket.on("participant-left", async (accessCode: string) => {
    const participantId = socket.data.participantId

    if (!participantId || !accessCode) return

    await prisma.participant.update({
      where: { id: participantId },
      data: { isActive: false },
    })

    await broadcastParticipants(io, accessCode)

    const leaderboard = await getLeaderboardByAccessCode(accessCode)
    if (leaderboard) {
      io.to(accessCode).emit("leaderboard-updated", leaderboard)
    }

    socket.leave(accessCode)
  })

}