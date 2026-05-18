"use client"

import { useState, useTransition } from "react"
import { createQuestionAction } from "@/features/question/question-actions"
import { useRouter } from "next/navigation"
import { SlideCarousel } from "@/features/question/components/SlideCarousel"
import { QuestionType } from "@prisma/client"
import { generateQuestionsPreviewAction } from "@/features/ai/ai-questions-actions"
import { Spinner } from "@/components/ui/Spinner"
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline"

type SlideCarouselItem = {
  id: string
  order: number
  type: "PDF" | "QUESTION"
  page?: number
  question: {
    content: string
  } | null
}

type CreateOptionInput = {
  content: string
  isCorrect: boolean
}

const questionTypeOptions: {
  value: QuestionType
  label: string
}[] = [
  { value: "MULTIPLE_CHOICE", label: "Opción múltiple" },
  { value: "TRUE_FALSE", label: "Verdadero / Falso" },
  { value: "SHORT_ANSWER", label: "Respuesta corta" },
]

export function CreateQuestionModal({
  sessionId,
  slides,
}: {
  sessionId: string
  slides: SlideCarouselItem[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [content, setContent] = useState("")
  const [insertAt, setInsertAt] = useState(0)
  const [questionType, setQuestionType] = useState<QuestionType>("MULTIPLE_CHOICE")
  const [trueFalseCorrect, setTrueFalseCorrect] = useState<"TRUE" | "FALSE">("TRUE")

  const [aiFromPage, setAiFromPage] = useState(1)
  const [aiToPage, setAiToPage] = useState(1)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSuccess, setAiSuccess] = useState<string | null>(null)

  const [isQuestionTypeOpen, setIsQuestionTypeOpen] = useState(false)

  const [mcqOptions, setMcqOptions] = useState<CreateOptionInput[]>([
    { content: "", isCorrect: true },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ])

  const MAX_AI_PAGE_RANGE = 10

  const aiPageRangeLength = aiToPage - aiFromPage + 1

  const isAiRangeValid =
    aiFromPage >= 1 &&
    aiToPage >= aiFromPage &&
    aiPageRangeLength <= MAX_AI_PAGE_RANGE

  const aiRangeHelperText = isAiRangeValid
    ? `Se usará el contenido de las páginas ${aiFromPage} a ${aiToPage}. Máximo ${MAX_AI_PAGE_RANGE} páginas por generación.`
    : aiToPage < aiFromPage
      ? "La página final no puede ser menor que la página inicial."
      : `Solo puedes usar un máximo de ${MAX_AI_PAGE_RANGE} páginas por generación.`

  const selectedQuestionTypeLabel =
    questionTypeOptions.find((option) => option.value === questionType)?.label ??
    "Opción múltiple"

  function updateMcqOption(index: number, value: string) {
    setMcqOptions((prev) =>
      prev.map((option, i) =>
        i === index ? { ...option, content: value } : option
      )
    )
  }

  function setMcqCorrect(index: number) {
    setMcqOptions((prev) =>
      prev.map((option, i) => ({
        ...option,
        isCorrect: i === index,
      }))
    )
  }

  function buildOptions(): CreateOptionInput[] {
    if (questionType === "TRUE_FALSE") {
      return [
        { content: "Verdadero", isCorrect: trueFalseCorrect === "TRUE" },
        { content: "Falso", isCorrect: trueFalseCorrect === "FALSE" },
      ]
    }

    if (questionType === "SHORT_ANSWER") {
      return []
    }

    return mcqOptions
  }

  function resetForm() {
    setContent("")
    setInsertAt(0)
    setQuestionType("MULTIPLE_CHOICE")
    setTrueFalseCorrect("TRUE")
    setAiFromPage(1)
    setAiToPage(1)
    setAiError(null)
    setAiSuccess(null)
    setIsQuestionTypeOpen(false)
    setMcqOptions([
      { content: "", isCorrect: true },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
    ])
  }

  function closeModal() {
    setIsOpen(false)
    resetForm()
  }

  function handleAiFromPageChange(value: number) {
    const nextFromPage = Math.max(1, value || 1)

    setAiFromPage(nextFromPage)
    setAiSuccess(null)
    setAiError(null)

    if (aiToPage < nextFromPage) {
      setAiToPage(nextFromPage)
    }

    if (aiToPage - nextFromPage + 1 > MAX_AI_PAGE_RANGE) {
      setAiToPage(nextFromPage + MAX_AI_PAGE_RANGE - 1)
    }
  }

  function handleAiToPageChange(value: number) {
    const nextToPage = Math.max(1, value || 1)

    setAiSuccess(null)
    setAiError(null)

    if (nextToPage < aiFromPage) {
      setAiToPage(aiFromPage)
      return
    }

    if (nextToPage - aiFromPage + 1 > MAX_AI_PAGE_RANGE) {
      setAiToPage(aiFromPage + MAX_AI_PAGE_RANGE - 1)
      return
    }

    setAiToPage(nextToPage)
  }

  async function handleGenerateWithAi() {
    if (!isAiRangeValid) {
      setAiError("Selecciona un rango de páginas válido.")
      return
    }

    try {
      setIsGeneratingAi(true)
      setAiError(null)
      setAiSuccess(null)

      const result = await generateQuestionsPreviewAction({
        sessionId,
        fromPage: aiFromPage,
        toPage: aiToPage,
        amount: 1,
        type: questionType,
      })

      const generatedQuestion = result.questions[0]

      if (!generatedQuestion) {
        throw new Error("No se ha generado ninguna pregunta.")
      }

      setQuestionType(generatedQuestion.type)
      setContent(generatedQuestion.content)

      if (generatedQuestion.type === "MULTIPLE_CHOICE") {
        setMcqOptions(generatedQuestion.options)
      }

      if (generatedQuestion.type === "TRUE_FALSE") {
        const correctOption = generatedQuestion.options.find((option) => option.isCorrect)
        const normalizedCorrectContent = correctOption?.content.toLowerCase() ?? ""

        setTrueFalseCorrect(
          normalizedCorrectContent.includes("verdadero") ||
          normalizedCorrectContent.includes("true")
            ? "TRUE"
            : "FALSE"
        )
      }

      if (generatedQuestion.type === "SHORT_ANSWER") {
        setMcqOptions([
          { content: "", isCorrect: true },
          { content: "", isCorrect: false },
          { content: "", isCorrect: false },
          { content: "", isCorrect: false },
        ])
      }

      setAiSuccess(
        `Pregunta generada a partir de las páginas ${aiFromPage}-${aiToPage}. Puedes revisarla y editarla antes de guardar.`
      )
    } catch (err: any) {
      setAiError(err.message || "Error al generar la pregunta con IA.")
    } finally {
      setIsGeneratingAi(false)
    }
  }

  function handleSubmit() {
    if (!content.trim()) return
    if (insertAt < 0) return

    const finalOptions = buildOptions()

    startTransition(async () => {
      try {
        await createQuestionAction({
          sessionId,
          content,
          type: questionType,
          options: finalOptions,
          insertAt: insertAt + 1,
        })

        setIsOpen(false)
        resetForm()
        router.refresh()
      } catch (err: any) {
        alert(err.message || "Error al crear la pregunta")
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-800 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-600 active:scale-[0.98]"
      >
        + Añadir pregunta
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#142544] text-white shadow-2xl shadow-black/40">
            <div className="shrink-0 border-b border-white/10 px-8 py-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-blue-300">
                    Editor de preguntas
                  </p>

                  <h2 className="text-3xl font-bold">
                    Nueva pregunta
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
                    Crea una pregunta manualmente o genera una propuesta con IA a partir del contenido del PDF.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending || isGeneratingAi}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6 pr-6 [scrollbar-width:thin] [scrollbar-color:rgb(82_82_91)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="mb-3 block text-sm font-medium text-white/65">
                    Insertar después de
                  </label>

                  <SlideCarousel
                    slides={slides}
                    selectedIndex={insertAt}
                    onSelect={(index) => {
                      setInsertAt(index)
                      setAiError(null)
                      setAiSuccess(null)

                      const selectedSlide = slides[index]

                      if (selectedSlide?.type === "PDF" && selectedSlide.page) {
                        setAiToPage(selectedSlide.page)
                        setAiFromPage(Math.max(1, selectedSlide.page - 4))
                      }
                    }}
                  />
                </div>

                <div className="overflow-hidden rounded-3xl border border-blue-400/20 bg-blue-500/10">
                  <div className="border-b border-white/10 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-blue-100">
                          Generación con IA
                        </h3>

                        <p className="mt-1 text-sm leading-relaxed text-white/50">
                          Genera una propuesta de pregunta usando el contenido de un rango de páginas del PDF.
                        </p>
                      </div>

                      <span className="rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-200">
                        Beta
                      </span>
                    </div>
                  </div>

                  {isGeneratingAi ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-400/10">
                        <Spinner />
                      </div>

                      <h4 className="text-xl font-bold text-white">
                        Generando pregunta...
                      </h4>

                      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
                        Estamos analizando las páginas {aiFromPage}-{aiToPage} del PDF para crear una propuesta.
                        Esto puede tardar unos segundos.
                      </p>

                      <div className="mt-6 h-2 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-1/3 rounded-full bg-blue-300 animate-[aiLoadingBar_1.2s_ease-in-out_infinite]"/>
                      </div>

                      <p className="mt-4 text-xs text-white/35">
                        No cierres esta ventana mientras se genera la pregunta.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 p-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-3">
                          <label className="mb-3 block text-sm font-medium text-white/65">
                            Desde página
                          </label>

                          <input
                            type="number"
                            min={1}
                            value={aiFromPage}
                            onChange={(e) => handleAiFromPageChange(Number(e.target.value))}
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-4 text-white outline-none transition focus:border-blue-400/60 focus:bg-white/10"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="mb-3 block text-sm font-medium text-white/65">
                            Hasta página
                          </label>

                          <input
                            type="number"
                            min={aiFromPage}
                            max={aiFromPage + MAX_AI_PAGE_RANGE - 1}
                            value={aiToPage}
                            onChange={(e) => handleAiToPageChange(Number(e.target.value))}
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-4 text-white outline-none transition focus:border-blue-400/60 focus:bg-white/10"
                          />
                        </div>
                      </div>

                      <p className={`text-xs ${isAiRangeValid ? "text-white/40" : "text-amber-300"}`}>
                        {aiRangeHelperText}
                      </p>

                      {aiError && (
                        <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                          {aiError}
                        </p>
                      )}

                      {aiSuccess && (
                        <p className="rounded-xl border border-green-500/25 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                          {aiSuccess}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleGenerateWithAi}
                        disabled={!isAiRangeValid}
                        className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {content.trim() ? "Regenerar con IA" : "Generar con IA"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="mb-3 block text-sm font-medium text-white/65">
                    Tipo de pregunta
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      disabled={isPending || isGeneratingAi}
                      onClick={() => setIsQuestionTypeOpen((prev) => !prev)}
                      onBlur={() => {
                        setTimeout(() => setIsQuestionTypeOpen(false), 120)
                      }}
                      className="
                        flex
                        h-11
                        w-full
                        cursor-pointer
                        items-center
                        justify-between
                        gap-3
                        rounded-xl
                        border border-white/10
                        bg-black/15
                        px-4
                        text-sm
                        text-white
                        outline-none
                        transition
                        hover:bg-white/10
                        focus:border-blue-400/60
                        focus:bg-white/10
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <span>{selectedQuestionTypeLabel}</span>

                      <ChevronDownIcon
                        className={`h-4 w-4 text-white/45 transition-transform ${
                          isQuestionTypeOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isQuestionTypeOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-2 flex flex-col gap-1 overflow-hidden rounded-xl border border-white/10 bg-[#0b1628] p-1 shadow-2xl shadow-black/30">
                        {questionTypeOptions.map((option) => {
                          const isSelected = questionType === option.value

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setQuestionType(option.value)
                                setAiSuccess(null)
                                setAiError(null)
                                setIsQuestionTypeOpen(false)
                              }}
                              className={`
                                flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition
                                ${
                                  isSelected
                                    ? "bg-blue-500/15 text-blue-200"
                                    : "text-white/75 hover:bg-white/10 hover:text-white"
                                }
                              `}
                            >
                              <span>{option.label}</span>

                              {isSelected && (
                                <CheckIcon className="h-4 w-4 text-blue-300" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="mb-3 block text-sm font-medium text-white/65">
                    Enunciado
                  </label>

                  <textarea
                    className="min-h-28 w-full resize-none rounded-xl border border-white/10 bg-black/15 p-4 text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/60 focus:bg-white/10"
                    placeholder="Escribe la pregunta..."
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value)
                      setAiSuccess(null)
                    }}
                  />
                </div>

                {questionType === "MULTIPLE_CHOICE" && (
                  <div className="space-y-3">
                    <label className="mb-3 block text-sm font-medium text-white/65">
                      Opciones de respuesta
                    </label>

                    {mcqOptions.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                          option.isCorrect
                            ? "border-blue-400/40 bg-blue-500/10"
                            : "border-white/10 bg-black/15"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={option.isCorrect}
                          onChange={() => setMcqCorrect(index)}
                          className="h-4 w-4 cursor-pointer accent-blue-500"
                        />

                        <input
                          type="text"
                          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                          placeholder={`Opción ${index + 1}`}
                          value={option.content}
                          onChange={(e) => {
                            updateMcqOption(index, e.target.value)
                            setAiSuccess(null)
                          }}
                        />

                        {option.isCorrect && (
                          <span className="rounded-full bg-green-400/15 px-2.5 py-1 text-xs font-semibold text-green-200">
                            Correcta
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {questionType === "TRUE_FALSE" && (
                  <div className="space-y-3">
                    <label className="mb-3 block text-sm font-medium text-white/65">
                      Respuesta correcta
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                          trueFalseCorrect === "TRUE"
                            ? "border-green-400/30 bg-green-500/10"
                            : "border-white/10 bg-black/15 hover:bg-white/5"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={trueFalseCorrect === "TRUE"}
                          onChange={() => setTrueFalseCorrect("TRUE")}
                          className="h-4 w-4 cursor-pointer accent-green-500"
                        />
                        <span>Verdadero</span>
                      </label>

                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                          trueFalseCorrect === "FALSE"
                            ? "border-green-400/30 bg-green-500/10"
                            : "border-white/10 bg-black/15 hover:bg-white/5"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={trueFalseCorrect === "FALSE"}
                          onChange={() => setTrueFalseCorrect("FALSE")}
                          className="h-4 w-4 cursor-pointer accent-green-500"
                        />
                        <span>Falso</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-white/10 bg-[#142544] px-8 py-5">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending || isGeneratingAi}
                  className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending || isGeneratingAi}
                  className="cursor-pointer rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Guardando..." : "Guardar pregunta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}