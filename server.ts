import "dotenv/config"
import { createServer } from "http"
import next from "next"
import { Server } from "socket.io"
import { prisma } from "@/lib/prisma"
import { getParticipantsByAccessCode, getLeaderboardByAccessCode, getQuestionStats } from "@/lib/services/session-service"
import { auth } from "@/lib/auth"

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  })

    io.use(async (socket, next) => {
      try {
        const cookieHeader = socket.handshake.headers.cookie

        if (cookieHeader) {
          const session = await auth.api.getSession({
            headers: {
              cookie: cookieHeader,
            },
          })

          if (session?.user) {
            socket.data.user = session.user
          }
        }

        next()
      } catch (err) {
        next(new Error("Authentication error"))
      }
    })

    io.on("connection", (socket) => {
      console.log("Socket conectado:", socket.id)

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
        if (!leaderboard) return

        socket.emit("leaderboard-updated", leaderboard)

        const activeQuestion = await prisma.question.findFirst({
          where: {
            sessionId: session.id,
            isActive: true,
          },
        })

        if (activeQuestion && activeQuestion.startedAt && activeQuestion.endedAt) {
          const now = new Date()

          const remaining = Math.max(
            0,
            Math.floor(
              (activeQuestion.endedAt.getTime() - now.getTime()) / 1000
            )
          )

          if (remaining > 0) {
            socket.emit("question-started", {
              questionId: activeQuestion.id,
              timeLimit: remaining,
              startedAt: activeQuestion.startedAt,
            })
          } else {
            await prisma.question.update({
              where: { id: activeQuestion.id },
              data: { isActive: false },
            })

            const stats = await getQuestionStats(activeQuestion.id)

            socket.emit("question-ended")
            socket.emit("question-stats-updated", stats)
          }
        }

      })

      socket.on("participant-joined", async (accessCode: string, participantId: string) => {
        socket.data.participantId = participantId
        socket.data.role = "participant"
        socket.data.accessCode = accessCode

        await prisma.participant.update({
          where: { id: participantId },
          data: { lastSeen: new Date(), isActive: true},
        })
        socket.join(accessCode)

        const session = await prisma.teachingSession.findUnique({
          where: { accessCode },
        })

        if (!session) return

        const participants = await getParticipantsByAccessCode(accessCode)
        
        io.to(accessCode).emit("participants-list", participants)

        const leaderboard = await getLeaderboardByAccessCode(accessCode)
        if (!leaderboard) return

        socket.emit("leaderboard-updated", leaderboard)

        const activeQuestion = await prisma.question.findFirst({
          where: {
            sessionId: session.id,
            isActive: true,
          },
        })

        if (activeQuestion && activeQuestion.startedAt && activeQuestion.endedAt) {
          const now = new Date()

          const remaining = Math.max(
            0,
            Math.floor(
              (activeQuestion.endedAt.getTime() - now.getTime()) / 1000
            )
          )

          if (remaining > 0) {
            socket.emit("question-started", {
              questionId: activeQuestion.id,
              timeLimit: remaining,
              startedAt: activeQuestion.startedAt,
            })
          } else {
            await prisma.question.update({
              where: { id: activeQuestion.id },
              data: { isActive: false },
            })

            const stats = await getQuestionStats(activeQuestion.id)

            socket.emit("question-ended")
            socket.emit("question-stats-updated", stats)
          }
        }
      })

      socket.on("disconnect", async () => {
        if (socket.data.role !== "participant") return

        const { participantId, accessCode } = socket.data
        if (!participantId || !accessCode) return

        await prisma.participant.update({
          where: { id: participantId },
          data: { isActive: false },
        })

        const participants = await getParticipantsByAccessCode(accessCode)
        if (!participants) return

        io.to(accessCode).emit("participants-list", participants)
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

      socket.on("page-changed", async (newPage: number) => {
        const accessCode = socket.data.accessCode

        if (!accessCode) return
        if (socket.data.role !== "owner") return
        if (typeof newPage !== "number") return
        if (newPage < 1) return

        const session = await prisma.teachingSession.findUnique({
          where: { accessCode },
        })

        if (!session) return


        await prisma.teachingSession.update({
          where: { accessCode },
          data: { currentPage: newPage },
        })

        const question = await prisma.question.findFirst({
          where: {
            sessionId: session.id,
            pageNumber: newPage,
          },
        })

        if (question) {
          const stats = await getQuestionStats(question.id)
          io.to(accessCode).emit("question-stats-updated", stats)
        }

        io.to(accessCode).emit("page-updated", newPage)
      })

      socket.on("answer-submitted", async () => {

        const accessCode = socket.data.accessCode
        if (!accessCode) return

        const session = await prisma.teachingSession.findUnique({
          where: { accessCode },
        })

        if (!session) return

        const activeQuestion = await prisma.question.findFirst({
          where: {
            sessionId: session.id,
            isActive: true,
          },
        })

        if (!activeQuestion) return

        const now = new Date()
        if (activeQuestion.endedAt && activeQuestion.endedAt < now) {
          return
        }
        
        const leaderboard = await getLeaderboardByAccessCode(accessCode)
        if (leaderboard) {
          io.to(accessCode).emit("leaderboard-updated", leaderboard)
        }
        
        const stats = await getQuestionStats(activeQuestion.id)

        io.to(accessCode).emit("question-stats-updated", stats)
      })

      socket.on("launch-question", async () => {
        const accessCode = socket.data.accessCode

        if (!accessCode) return
        if (socket.data.role !== "owner") return

        const session = await prisma.teachingSession.findUnique({
          where: { accessCode },
          include: { questions: true },
        })

        if (!session) return

        const question = session.questions.find(
          (q) => q.pageNumber === session.currentPage
        )

        if (!question) return

        io.to(accessCode).emit("question-countdown", {
          seconds: 3,
        })

        setTimeout(async () => {

          const updatedSession = await prisma.teachingSession.findUnique({
            where: { accessCode },
          })

          if (!updatedSession) return
          if (updatedSession.currentPage !== question.pageNumber) return

          const now = new Date()
          
          const timeLimit = question.timeLimit ?? 30

          const endedAt = new Date(
            now.getTime() + timeLimit * 1000
          )

          await prisma.question.update({
            where: { id: question.id },
            data: {
              isActive: true,
              startedAt: now,
              endedAt,
            },
          })

          io.to(accessCode).emit("question-started", {
            questionId: question.id,
            timeLimit: timeLimit,
            startedAt: now,
          })

          setTimeout(async () => {

            await prisma.question.update({
              where: { id: question.id },
              data: { isActive: false },
            })

            const stats = await getQuestionStats(question.id)

            io.to(accessCode).emit("question-ended")
            io.to(accessCode).emit("question-stats-updated", stats)

          }, timeLimit * 1000)

        }, 3000)
      })

      socket.on("end-question", async () => {
        const accessCode = socket.data.accessCode

        if (!accessCode) return
        if (socket.data.role !== "owner") return

        const session = await prisma.teachingSession.findUnique({
          where: { accessCode },
          include: { questions: true },
        })

        if (!session) return

        const activeQuestion = session.questions.find(
          q => q.isActive === true
        )

        if (!activeQuestion) return

        const now = new Date()

        await prisma.question.update({
          where: { id: activeQuestion.id },
          data: {
            isActive: false,
            endedAt: now,
          },
        })

        const stats = await getQuestionStats(activeQuestion.id)

        io.to(accessCode).emit("question-ended")
        io.to(accessCode).emit("question-stats-updated", stats)
      })

    })

  httpServer.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`)
  })
})