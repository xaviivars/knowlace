"use client"

import { useState, useTransition } from "react"
import { createQuestionAction } from "@/features/question/question-actions"
import { useRouter } from "next/navigation"
import { SlideCarousel } from "@/features/question/components/SlideCarousel"
import { QuestionType } from "@prisma/client"
import { reset } from "canvas-confetti"

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

    return mcqOptions
  }

  function resetForm() {
    setContent("")
    setInsertAt(0)
    setQuestionType("MULTIPLE_CHOICE")
    setTrueFalseCorrect("TRUE")
    setMcqOptions([
      { content: "", isCorrect: true },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
    ])
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
          insertAt
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
                onSelect={setInsertAt}
              />
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