import "dotenv/config"
import { createServer } from "http"
import next from "next"
import { Server } from "socket.io"
import { prisma } from "@/lib/prisma"
import { getParticipantsByAccessCode } from "@/lib/services/session-service"
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
        const participants = await getParticipantsByAccessCode(accessCode)

        if (!participants) return

        socket.join(accessCode)
        socket.data.role = "viewer"
        socket.data.accessCode = accessCode

        socket.emit("participants-list", participants)
      })

      socket.on("participant-joined", async (accessCode: string, participantId: string) => {
        socket.data.participantId = participantId
        socket.data.role = "participant"
        socket.data.accessCode = accessCode

        const session = await prisma.teachingSession.findUnique({
          where: { accessCode },
        })

        if (!session) return

        await prisma.participant.update({
          where: { id: participantId },
          data: { lastSeen: new Date() },
        })
          
        const participants = await getParticipantsByAccessCode(accessCode)

        socket.join(accessCode)
        io.to(accessCode).emit("participants-list", participants)
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

        await prisma.teachingSession.update({
          where: { accessCode },
          data: { currentPage: newPage },
        })

        io.to(accessCode).emit("page-updated", newPage)
      })

    })

  httpServer.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`)
  })
})