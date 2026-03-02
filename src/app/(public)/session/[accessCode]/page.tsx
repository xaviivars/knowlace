import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import SessionClient from "./SessionClient"

export default async function PublicSessionPage({
  params,
}: {
  params: Promise <{ accessCode: string }>
}) {
  const { accessCode } = await params

  const normalizedCode = accessCode.toUpperCase()

  const session = await prisma.teachingSession.findUnique({
    where: {
      accessCode: normalizedCode,
    },
     include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  })

  if (!session) {
    notFound()
  }

  const participants = await prisma.participant.findMany({
    where: { sessionId: session.id, isActive: true },
    orderBy: { createdAt: "asc" }
  })

  return (
    <div className="min-h-screen bg-[#0e1d38] text-white flex flex-col items-center justify-center px-6">

      <SessionClient accessCode={normalizedCode} initialIsActive={session.isActive} initialParticipants={participants} sessionTitle={session.title} initialPage={session.currentPage} questions={session.questions} />
      
    </div>
  )
}