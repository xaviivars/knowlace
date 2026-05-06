"use client"

import { useState, useTransition } from "react"
import { createQuestionAction } from "@/features/question/question-actions"
import { useRouter } from "next/navigation"
import { SlideCarousel } from "@/features/question/components/SlideCarousel"
import { QuestionType } from "@prisma/client"
import { generateQuestionsPreviewAction } from "@/features/ai/ai-questions-actions"

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

  const [mcqOptions, setMcqOptions] = useState<CreateOptionInput[]>([
    { content: "", isCorrect: true },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ])

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
    setMcqOptions([
      { content: "", isCorrect: true },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
    ])
  }

  async function handleGenerateWithAi() {
    if (questionType !== "MULTIPLE_CHOICE") {
      setAiError("De momento la generación con IA solo está disponible para preguntas de opción múltiple.")
      return
    }

    if (aiFromPage < 1 || aiToPage < aiFromPage) {
      setAiError("Selecciona un rango de páginas válido.")
      return
    }

    try {
      setIsGeneratingAi(true)
      setAiError(null)

      const result = await generateQuestionsPreviewAction({
        sessionId,
        fromPage: aiFromPage,
        toPage: aiToPage,
        amount: 1,
        type: "MULTIPLE_CHOICE",
      })

      console.log("AI source pages:", result.sourcePages)
      console.log("AI source text:", result.sourceText)

      const generatedQuestion = result.questions[0]

      if (!generatedQuestion) {
        throw new Error("No se ha generado ninguna pregunta.")
      }

      setQuestionType(generatedQuestion.type)
      setContent(generatedQuestion.content)
      setMcqOptions(generatedQuestion.options)
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
        className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        Añadir pregunta
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 text-white p-8 space-y-6 shadow-2xl border border-zinc-700">

            <h2 className="text-2xl font-bold">
              Nueva pregunta
            </h2>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">
                Posición (slide)
              </label>
              <SlideCarousel
                slides={slides}
                selectedIndex={insertAt}
                onSelect={(index) => {
                  setInsertAt(index)

                  const selectedSlide = slides[index]

                  if (selectedSlide?.type === "PDF" && selectedSlide.page) {
                    setAiToPage(selectedSlide.page)
                    setAiFromPage(Math.max(1, selectedSlide.page - 4))
                  }
                }}
              />
            </div>

            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-indigo-200">
                  Generación con IA
                </h3>
                <p className="text-sm text-zinc-400">
                  Selecciona el rango de páginas del PDF que se usará como contexto para generar una pregunta.
                </p>
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
                    onChange={(e) => setAiFromPage(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">
                    Hasta página
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={aiToPage}
                    onChange={(e) => setAiToPage(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {aiError && (
                <p className="text-sm text-red-400">
                  {aiError}
                </p>
              )}

              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isGeneratingAi || questionType !== "MULTIPLE_CHOICE"}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingAi
                  ? "Generando..."
                  : content.trim()
                    ? "Regenerar con IA"
                    : "Generar con IA"}
              </button>

              {questionType !== "MULTIPLE_CHOICE" && (
                <p className="text-xs text-zinc-500">
                  Por ahora la IA solo genera preguntas de opción múltiple.
                </p>
              )}
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
              onChange={(e) => setContent(e.target.value)}
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
                      onChange={(e) =>
                        updateMcqOption(index, e.target.value)
                      }
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
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
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