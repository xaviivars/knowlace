import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import CreateQuestionModal from "@/components/questions/CreateQuestionModal"

export default async function SessionEditorPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const sessionAuth = await auth.api.getSession({
    headers: await headers(),
  })

  if (!sessionAuth) {
    throw new Error("Unauthorized")
  }

  const { sessionId } = await params

  const session = await prisma.teachingSession.findUnique({
    where: { id: sessionId  },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
    },
  })

  if (!session) notFound()

  if (session.ownerId !== sessionAuth.user.id) {
    throw new Error("Forbidden")
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{session.title}</h1>
          <p className="text-gray-500">{session.description}</p>
        </div>

        <Link
          href={`/dashboard/sessions/${sessionId}`}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          Volver a sesión
        </Link>
      </div>

    <div className="flex justify-end">
        <CreateQuestionModal sessionId={session.id} />
    </div>

      <div className="space-y-6">
        {session.questions.length === 0 ? (
          <p className="text-gray-500">No hay preguntas todavía.</p>
        ) : (
          session.questions.map((question, index) => (
            <div
              key={question.id}
              className="border rounded-xl p-5 space-y-4"
            >
              <h2 className="font-semibold">
                Pregunta {index + 1}
              </h2>

              <p>{question.content}</p>

              <ul className="space-y-1">
                {question.options.map((option) => (
                  <li
                    key={option.id}
                    className={
                      option.isCorrect
                        ? "font-medium text-green-600"
                        : ""
                    }
                  >
                    • {option.content}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  )
}