import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import SessionContainer from "@/features/session/containers/session.container"

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
    where: { 
      sessionId: session.id, 
      isActive: true
    },
    orderBy: { 
      createdAt: "asc" 
    }
  })

  return (
    <SessionContainer
      accessCode={normalizedCode}
      sessionTitle={session.title}
      initialIsActive={session.isActive}
      initialParticipants={participants}
      initialPage={session.currentPage}
      questions={session.questions}
    />
  )
}