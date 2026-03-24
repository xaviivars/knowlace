import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import SessionContainer from "@/features/session/containers/session.container"
import { getSlidesBySessionAction } from "@/features/question/question-actions"

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

  const slides = await getSlidesBySessionAction(session.id)

  return (
    <SessionContainer
      accessCode={normalizedCode}
      sessionTitle={session.title}
      initialIsActive={session.isActive}
      initialParticipants={participants}
      initialSlideIndex={session.currentPage}
      slides={slides}
      pdfUrl={session.pdfUrl}
    />
  )
}