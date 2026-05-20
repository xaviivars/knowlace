import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArchivedSessionHistoryView } from "@/features/session/components/teacher/ArchivedSessionHistoryView"

export default async function ArchivedSessionHistoryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (!authSession) {
    throw new Error("Unauthorized")
  }

  const { sessionId } = await params

  const session = await prisma.teachingSession.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      participants: {
        include: {
          answers: {
            include: {
              option: true,
              question: true,
            },
          },
        },
        orderBy: {
          score: "desc",
        },
      },
      questions: {
        include: {
          options: true,
          answers: {
            include: {
              option: true,
              participant: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!session) notFound()

  if (session.ownerId !== authSession.user.id) {
    throw new Error("Forbidden")
  }

  if (!session.isArchived) {
    return (
      <div className="p-8 text-white">
        <p>Esta sesión no está archivada.</p>

        <Link
          href={`/dashboard/sessions/${session.id}`}
          className="mt-4 inline-flex rounded-xl bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          Volver a la sesión
        </Link>
      </div>
    )
  }

  return (
    <ArchivedSessionHistoryView
      session={{
        id: session.id,
        title: session.title,
        description: session.description,
        accessCode: session.accessCode,
        createdAt: session.createdAt.toISOString(),
        archivedAt: session.archivedAt?.toISOString() ?? null,
        participants: session.participants.map((participant) => {
          const totalAnswers = participant.answers.length
          const correctAnswers = participant.answers.filter(
            (answer) => answer.option?.isCorrect
          ).length

          const accuracy =
            totalAnswers > 0
              ? Math.round((correctAnswers / totalAnswers) * 100)
              : 0

          return {
            id: participant.id,
            name: participant.name,
            score: participant.score,
            totalAnswers,
            correctAnswers,
            accuracy,
          }
        }),
        questions: session.questions.map((question) => {
          const totalAnswers = question.answers.length
          const correctAnswers = question.answers.filter(
            (answer) => answer.option?.isCorrect
          ).length

          const accuracy =
            totalAnswers > 0
              ? Math.round((correctAnswers / totalAnswers) * 100)
              : 0

          return {
            id: question.id,
            content: question.content,
            type: question.type,
            totalAnswers,
            correctAnswers,
            accuracy,
          }
        }),
      }}
    />
  )
}