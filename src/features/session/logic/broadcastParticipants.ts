import { Server } from "socket.io"
import { getParticipantsByAccessCode } from "@/features/session/session-service"

export async function broadcastParticipants(io: Server, accessCode: string) {

  const participants = await getParticipantsByAccessCode(accessCode)

  if (!participants) return

  io.to(accessCode).emit("participants-list", participants)

}