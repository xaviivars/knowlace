import "dotenv/config"
import { createServer } from "http"
import next from "next"
import { Server } from "socket.io"
import { auth } from "@/lib/auth"
import { registerSessionSockets } from "@/features/session/session.socket"
import { registerQuestionSockets } from "@/features/question/question.socket"

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

  // AUTH Middleware
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

    registerSessionSockets(io, socket)

    registerQuestionSockets(io, socket)

  })

  httpServer.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`)
  })

})