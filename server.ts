import "dotenv/config"
import { createServer } from "http"
import next from "next"
import { Server } from "socket.io"
import { prisma } from "@/lib/prisma"

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

    io.on("connection", (socket) => {
    console.log("Socket conectado:", socket.id)

    socket.on("join-session", (accessCode: string) => {
    console.log("JOIN recibido:", accessCode)

    socket.join(accessCode)

    const room = io.sockets.adapter.rooms.get(accessCode)

    console.log("ROOM MAP:", io.sockets.adapter.rooms)
    console.log("ROOM DATA:", room)

    const count = room ? room.size : 0

    console.log("COUNT CALCULADO:", count)

    io.to(accessCode).emit("participants-count", count)
    })

    socket.on("disconnecting", () => {
        const rooms = socket.rooms

        rooms.forEach((room) => {
        if (room !== socket.id) {
            const roomData = io.sockets.adapter.rooms.get(room)
            const count = roomData ? roomData.size - 1 : 0

            io.to(room).emit("participants-count", count)
            
            console.log("COUNT CALCULADO:", count)

        }
        })
    })

    socket.on("start-session", (accessCode: string) => {
        io.to(accessCode).emit("session-started")
    })

    socket.on("end-session", (accessCode: string) => {
        io.to(accessCode).emit("session-ended")
    })

    socket.on("viewer-join", (accessCode: string) => {
      socket.join(accessCode)
    })

    socket.on("participant-joined", async (accessCode: string, participantId: string) => {
      socket.data.participantId = participantId
      socket.data.accessCode = accessCode

      const session = await prisma.teachingSession.findUnique({
        where: { accessCode },
      })

      if (!session) return

      await prisma.participant.update({
              where: { id: participantId },
              data: { lastSeen: new Date() },
      })
        
      const participants = await prisma.participant.findMany({
        where: { sessionId: session.id, isActive: true},
        orderBy: { createdAt: "asc" },
      })

      socket.join(accessCode)
      io.to(accessCode).emit("participants-list", participants)
    })

    socket.on("disconnect", async () => {
      const participantId = socket.data.participantId
      const accessCode = socket.data.accessCode

      if (!participantId || !accessCode) return

      await prisma.participant.update({
        where: { id: participantId },
        data: { isActive: false },
      })

      const session = await prisma.teachingSession.findUnique({
        where: { accessCode },
      })

      if (!session) return

      const participants = await prisma.participant.findMany({
        where: {
          sessionId: session.id,
          isActive: true,
        },
        orderBy: { createdAt: "asc" },
      })

        const activeCount = await prisma.participant.count({
          where: {
            sessionId: session.id,
            isActive: true
          }
        })
      
        if (activeCount === 0) {
          await prisma.teachingSession.update({
            where: { id: session.id },
            data: { isActive: false }
          })
        }

      io.to(accessCode).emit("participants-list", participants)
    })

    socket.on("participant-left", async (accessCode: string) => {
      const session = await prisma.teachingSession.findUnique({
        where: { accessCode },
      })

      if (!session) return

      const participants = await prisma.participant.findMany({
        where: {
          sessionId: session.id,
          isActive: true,
        },
        orderBy: { createdAt: "asc" },
      })

      const activeCount = participants.length

      if (activeCount === 0) {
        await prisma.teachingSession.update({
          where: { id: session.id },
          data: { isActive: false },
        })
      }

      io.to(accessCode).emit("participants-list", participants)
    })

    socket.on("page-changed", async (accessCode: string, newPage: number) => {
      const session = await prisma.teachingSession.findUnique({
        where: { accessCode },
      })

      if (!session) return

      await prisma.teachingSession.update({
        where: { id: session.id },
        data: { currentPage: newPage },
      })

      io.to(accessCode).emit("page-updated", newPage)
    })

    })

  httpServer.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`)
  })
})