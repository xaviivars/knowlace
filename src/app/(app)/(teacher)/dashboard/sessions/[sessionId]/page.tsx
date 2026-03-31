import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import OwnerSessionContainer from "@/features/session/containers/owner-session.container"
import { getSlidesBySessionAction } from "@/features/question/question-actions"
import { getParticipantsByAccessCode, getLeaderboardByAccessCode } from "@/features/session/session-service"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  const session = await prisma.teachingSession.findUnique({
    where: { 
      id: sessionId 
    },
  })

  if (!session) {
    notFound()
  }

  const [slides, participants, leaderboard] = await Promise.all([
    getSlidesBySessionAction(session.id),
    getParticipantsByAccessCode(session.accessCode),
    getLeaderboardByAccessCode(session.accessCode),
  ])

  return (
    <OwnerSessionContainer
      sessionId={session.id}
      accessCode={session.accessCode}
      title={session.title}
      description={session.description}
      initialIsActive={session.isActive}
      initialSlideIndex={session.currentPage}
      slides={slides}
      pdfUrl={session.pdfUrl}
      initialParticipants={participants ?? []}
      initialLeaderboard={leaderboard ?? []}
    />
  )
}