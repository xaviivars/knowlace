"use client"

import { useState, useTransition } from "react"
import { createQuestionAction } from "@/features/question/question-actions"
import { useRouter } from "next/navigation"
import { SlideCarousel } from "@/features/question/components/SlideCarousel"
import { QuestionType } from "@prisma/client"
import { generateQuestionsPreviewAction } from "@/features/ai/ai-questions-actions"
import { Spinner } from "@/components/ui/Spinner"

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

export function CreateQuestionModal({
  sessionId,
  slides
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
    setMcqOptions([
      { content: "", isCorrect: true },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
    ])
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
        type: questionType
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
          insertAt: insertAt + 1
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
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-xl cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        Añadir pregunta
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-zinc-900 text-white p-8 space-y-6 shadow-2xl border border-zinc-700 [scrollbar-width:thin] [scrollbar-color:rgb(82_82_91)_rgb(39_39_42)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-500">

            <div className="space-y-1">
              <h2 className="text-2xl font-bold">
                Nueva pregunta
              </h2>
              <p className="text-sm text-zinc-400">
                Crea una pregunta manualmente o genera una propuesta con IA a partir del PDF.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">
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

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-indigo-200">
                    Generación con IA
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Genera una propuesta de pregunta usando el contenido de un rango de páginas del PDF.
                  </p>
                </div>

                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-200">
                  Beta
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">
                    Desde página
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={aiFromPage}
                    onChange={(e) => handleAiFromPageChange(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">
                    Hasta página
                  </label>
                  <input
                    type="number"
                    min={aiFromPage}
                    max={aiFromPage + MAX_AI_PAGE_RANGE - 1}
                    value={aiToPage}
                    onChange={(e) => handleAiToPageChange(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <p className={`text-xs ${isAiRangeValid ? "text-zinc-500" : "text-amber-300"}`}>
                {aiRangeHelperText}
              </p>

              {isGeneratingAi && (
                <div className="flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-400/10 p-3 text-sm text-indigo-100">
                  <Spinner />
                  <span>
                    Generando una propuesta con IA...
                  </span>
                </div>
              )}

              {aiError && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {aiError}
                </p>
              )}

              {aiSuccess && (
                <p className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                  {aiSuccess}
                </p>
              )}

              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isGeneratingAi || !isAiRangeValid}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingAi && <Spinner />}

                {isGeneratingAi
                  ? "Generando pregunta..."
                  : content.trim()
                    ? "Regenerar con IA"
                    : "Generar con IA"}
              </button>

            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Tipo de pregunta</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="MULTIPLE_CHOICE">Opción múltiple</option>
                <option value="TRUE_FALSE">Verdadero / Falso</option>
                <option value="SHORT_ANSWER">Respuesta corta</option>
              </select>
            </div>

            <textarea
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Escribe la pregunta..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setAiSuccess(null)
              }}
            />

            {questionType === "MULTIPLE_CHOICE" && (
              <div className="space-y-3">
                {mcqOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={option.isCorrect}
                      onChange={() => setMcqCorrect(index)}
                      className="accent-indigo-500"
                    />
                    <input
                      type="text"
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Opción ${index + 1}`}
                      value={option.content}
                      onChange={(e) => {
                        updateMcqOption(index, e.target.value)
                        setAiSuccess(null)
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {questionType === "TRUE_FALSE" && (
              <div className="space-y-3">
                <label className="text-sm text-zinc-400">Respuesta correcta</label>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={trueFalseCorrect === "TRUE"}
                      onChange={() => setTrueFalseCorrect("TRUE")}
                      className="accent-indigo-500"
                    />
                    <span>Verdadero</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={trueFalseCorrect === "FALSE"}
                      onChange={() => setTrueFalseCorrect("FALSE")}
                      className="accent-indigo-500"
                    />
                    <span>Falso</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { 
                  setIsOpen(false) 
                  resetForm()
                }}
                className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={isPending || isGeneratingAi }
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  )
}