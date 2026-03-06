import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import OwnerSessionContainer from "@/features/session/containers/owner-session.container"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  const session = await prisma.teachingSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: {
        include: {
          options: true
        }
      }
    }
  })

  if (!session) {
    notFound()
  }

  return (
    <OwnerSessionContainer
      sessionId={session.id}
      accessCode={session.accessCode}
      title={session.title}
      description={session.description}
      initialIsActive={session.isActive}
      initialPage={session.currentPage}
      questions={session.questions}
    />
  )
}