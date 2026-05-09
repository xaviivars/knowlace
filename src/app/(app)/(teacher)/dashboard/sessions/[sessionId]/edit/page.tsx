import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CreateQuestionModal } from "@/features/question/components/CreateQuestionModal"
import { deleteQuestionWithSlide, getSlidesBySessionAction } from "@/features/question/question-actions"

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
      slides: {
        orderBy: { order: "asc" },
        include: { 
          question: {
            include: { options: true }
          }
        },
      },
    }
  })

  if (!session) notFound()

  if (session.ownerId !== sessionAuth.user.id) {
    throw new Error("Forbidden")
  }

  const fullSlides = await getSlidesBySessionAction(session.id)

  const carouselSlides = fullSlides.map((slide, index) => ({
    id: slide.type === "PDF" ? `pdf-${slide.page}` : `question-${slide.question.id}`,
    order: index,
    type: slide.type as "PDF" | "QUESTION",
    page: slide.type === "PDF" ? slide.page : undefined,
    question:
      slide.type === "QUESTION"
        ? { content: slide.question.content }
        : null,
  }))

  return (

    <div className="flex h-full min-h-0 flex-col px-6 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-1 min-h-0 flex-col space-y-6">

        <div className="flex shrink-0 items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{session.title}</h1>
            <p className="text-gray-500">{session.description}</p>
          </div>

          <Link
            href={`/dashboard/sessions/${sessionId}`}
            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500"
          >
            Volver a sesión
          </Link>
        </div>

        <div className="flex shrink-0 justify-end">
            <CreateQuestionModal sessionId={session.id} slides={carouselSlides} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-2 space-y-6 [scrollbar-width:thin] [scrollbar-color:rgb(82_82_91)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-500">
          {session.slides.length === 0 ? (
            <p className="text-gray-500">No hay contenido todavía.</p>
          ) : (
            session.slides.map((slide, index) => {

              if (slide.type === "PDF") {
                return (
                  <div key={slide.id} className="rounded-xl border border-zinc-700 bg-zinc-800/70 p-5 text-zinc-300">
                    Página PDF {slide.page}
                  </div>
                )
              }

              if (!slide.question) return null

              const question = slide.question

              return (
                <div
                  key={question.id}
                  className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4 shadow-sm text-zinc-100"
                >
                  <h2 className="font-semibold">
                    Pregunta (posición {slide.order})
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

                  <form action={deleteQuestionWithSlide.bind(null, question.id)}>
                    <button className="text-red-500 hover:underline">
                      Eliminar pregunta
                    </button>
                  </form>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )}