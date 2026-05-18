import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CreateQuestionModal } from "@/features/question/components/CreateQuestionModal"
import { DeleteQuestionButton } from "@/features/question/components/DeleteQuestionButton"
import { EditQuestionModal } from "@/features/question/components/EditQuestionModal"
import { getSlidesBySessionAction } from "@/features/question/question-actions"

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
    where: { id: sessionId },
    include: {
      slides: {
        orderBy: { order: "asc" },
        include: {
          question: {
            include: { options: true },
          },
        },
      },
    },
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

  const questionSlides = session.slides.filter((slide) => slide.type === "QUESTION").length
  const pdfSlides = session.slides.filter((slide) => slide.type === "PDF").length

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0e1d38] px-6 py-8 text-white">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-7">
        <section className="shrink-0 rounded-3xl border border-white/10 bg-[#142544]/70 p-7 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-blue-300">
                Editor de preguntas
              </p>

              <h1 className="line-clamp-2 text-4xl font-bold tracking-tight">
                {session.title}
              </h1>

              <p className="mt-3 max-w-3xl text-white/60">
                {session.description || "Sin descripción para esta sesión."}
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm">

                <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-blue-200">
                  {questionSlides} pregunta{questionSlides === 1 ? "" : "s"}
                </span>

              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href={`/dashboard/sessions/${sessionId}`}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white active:scale-[0.98]"
              >
                ← Volver a sesión
              </Link>

              <CreateQuestionModal
                sessionId={session.id}
                slides={carouselSlides}
              />
            </div>
          </div>
        </section>

        <section className="min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:rgb(82_82_91)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
          {session.slides.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-[#142544]/70 p-10 text-center shadow-xl">

              <h2 className="text-2xl font-bold">
                Todavía no hay contenido editable
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-white/60">
                Añade preguntas interactivas a tus diapositivas para convertir el material en una sesión participativa.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {session.slides.map((slide) => {
                if (slide.type === "PDF") {
                  return (
                    <article
                      key={slide.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-white/70"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-white/55">
                            PDF
                          </div>

                          <div>
                            <p className="font-semibold text-white/85">
                              Página PDF {slide.page}
                            </p>

                            <p className="mt-0.5 text-sm text-white/40">
                              Diapositiva de material original
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-xs font-medium text-white/45">
                          Posición {slide.order}
                        </span>
                      </div>
                    </article>
                  )
                }

                if (!slide.question) return null

                const question = slide.question
                const correctOptions = question.options.filter((option) => option.isCorrect)

                return (
                  <article
                    key={question.id}
                    className="group rounded-3xl border border-white/10 bg-[#142544]/80 p-6 shadow-xl transition hover:border-blue-400/40 hover:shadow-blue-950/30"
                  >
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
                            Pregunta
                          </span>

                          <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-xs font-medium text-white/45">
                            Posición {slide.order}
                          </span>

                          <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-xs font-medium text-white/45">
                            {question.options.length} opcion{question.options.length === 1 ? "" : "es"}
                          </span>
                        </div>

                        <h2 className="text-xl font-bold leading-snug text-white">
                          {question.content}
                        </h2>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <EditQuestionModal
                          question={{
                            id: question.id,
                            content: question.content,
                            type: question.type,
                            options: question.options,
                          }}
                        />

                        <DeleteQuestionButton questionId={question.id} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <div
                          key={option.id}
                          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                            option.isCorrect
                              ? "border-green-400/30 bg-green-500/10 text-green-100"
                              : "border-white/10 bg-black/15 text-white/65"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              option.isCorrect
                                ? "bg-green-400/20 text-green-200"
                                : "bg-white/5 text-white/45"
                            }`}
                          >
                            {index + 1}
                          </span>

                          <p className="min-w-0 flex-1">
                            {option.content}
                          </p>

                          {option.isCorrect && (
                            <span className="shrink-0 rounded-full bg-green-400/15 px-2.5 py-1 text-xs font-semibold text-green-200">
                              Correcta
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {correctOptions.length === 0 && (
                      <p className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                        Esta pregunta no tiene ninguna respuesta marcada como correcta.
                      </p>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}