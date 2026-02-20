// server.ts
import { createServer } from "http"
import next from "next"
import { Server } from "socket.io"

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
        }
        })
    })

    socket.on("start-session", (accessCode: string) => {
        io.to(accessCode).emit("session-started")
    })
    })

  httpServer.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`)
  })
})