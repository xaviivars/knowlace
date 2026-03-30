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

  console.log(carouselSlides)

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{session.title}</h1>
          <p className="text-gray-500">{session.description}</p>
        </div>

        <Link
          href={`/dashboard/sessions/${sessionId}`}
          className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-300"
        >
          Volver a sesión
        </Link>
      </div>

    <div className="flex justify-end">
        <CreateQuestionModal sessionId={session.id} slides={carouselSlides} />
    </div>

      <div className="space-y-6">
        {session.slides.length === 0 ? (
          <p className="text-gray-500">No hay contenido todavía.</p>
        ) : (
          session.slides.map((slide, index) => {

            if (slide.type === "PDF") {
              return (
                <div key={slide.id} className="border rounded-xl p-5 bg-gray-100">
                  Página PDF {slide.page}
                </div>
              )
            }

            if (!slide.question) return null

            const question = slide.question

            return (
              <div
                key={question.id}
                className="border rounded-xl p-5 space-y-4"
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
  )}