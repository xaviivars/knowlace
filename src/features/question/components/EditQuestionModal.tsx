"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { QuestionType } from "@prisma/client"
import { CheckIcon, ChevronDownIcon, PencilSquareIcon } from "@heroicons/react/24/outline"
import { updateQuestionAction } from "@/features/question/question-actions"

type EditOptionInput = {
  id?: string
  content: string
  isCorrect: boolean
}

type EditQuestionModalProps = {
  question: {
    id: string
    content: string
    type: QuestionType
    options: {
      id: string
      content: string
      isCorrect: boolean
    }[]
  }
}

const questionTypeOptions: {
  value: QuestionType
  label: string
}[] = [
  { value: "MULTIPLE_CHOICE", label: "Opción múltiple" },
  { value: "TRUE_FALSE", label: "Verdadero / Falso" },
  { value: "SHORT_ANSWER", label: "Respuesta corta" },
]

export function EditQuestionModal({ question }: EditQuestionModalProps) {
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [content, setContent] = useState(question.content)
  const [questionType, setQuestionType] = useState<QuestionType>(question.type)
  const [isQuestionTypeOpen, setIsQuestionTypeOpen] = useState(false)

  const [trueFalseCorrect, setTrueFalseCorrect] = useState<"TRUE" | "FALSE">(() => {
    const correctOption = question.options.find((option) => option.isCorrect)
    const normalized = correctOption?.content.toLowerCase() ?? ""

    return normalized.includes("falso") || normalized.includes("false")
      ? "FALSE"
      : "TRUE"
  })

  const [mcqOptions, setMcqOptions] = useState<EditOptionInput[]>(() => {
    if (question.type === "MULTIPLE_CHOICE") {
      const options: EditOptionInput[] = question.options.map((option) => ({
        id: option.id,
        content: option.content,
        isCorrect: option.isCorrect,
      }))

      while (options.length < 4) {
        options.push({
          content: "",
          isCorrect: options.length === 0,
        })
      }

      return options
    }

    return [
      { content: "", isCorrect: true },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
    ]
  })

  const selectedQuestionTypeLabel =
    questionTypeOptions.find((option) => option.value === questionType)?.label ??
    "Opción múltiple"

  function resetForm() {
    setContent(question.content)
    setQuestionType(question.type)
    setIsQuestionTypeOpen(false)

    const correctOption = question.options.find((option) => option.isCorrect)
    const normalized = correctOption?.content.toLowerCase() ?? ""

    setTrueFalseCorrect(
      normalized.includes("falso") || normalized.includes("false")
        ? "FALSE"
        : "TRUE"
    )

    if (question.type === "MULTIPLE_CHOICE") {
      const options: EditOptionInput[] = question.options.map((option) => ({
        id: option.id,
        content: option.content,
        isCorrect: option.isCorrect,
      }))

      while (options.length < 4) {
        options.push({
          content: "",
          isCorrect: options.length === 0,
        })
      }

      setMcqOptions(options)
    }
  }

  function closeModal() {
    setIsOpen(false)
    resetForm()
  }

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

  function buildOptions() {
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

  function handleSubmit() {
    if (!content.trim()) return

    startTransition(async () => {
      try {
        await updateQuestionAction({
          questionId: question.id,
          content,
          type: questionType,
          options: buildOptions(),
        })

        setIsOpen(false)
        router.refresh()
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la pregunta"
        )
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
      >
        <PencilSquareIcon className="h-4 w-4" />
        Editar
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#142544] text-white shadow-2xl shadow-black/40">
            <div className="shrink-0 border-b border-white/10 px-8 py-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-blue-300">
                    Editor de preguntas
                  </p>

                  <h2 className="text-3xl font-bold">
                    Editar pregunta
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
                    Modifica el enunciado, el tipo y las respuestas de esta pregunta.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
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
                    Tipo de pregunta
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setIsQuestionTypeOpen((prev) => !prev)}
                      onBlur={() => {
                        setTimeout(() => setIsQuestionTypeOpen(false), 120)
                      }}
                      className="flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/15 px-4 text-sm text-white outline-none transition hover:bg-white/10 focus:border-blue-400/60 focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
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
                                setIsQuestionTypeOpen(false)
                              }}
                              className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                                isSelected
                                  ? "bg-blue-500/15 text-blue-200"
                                  : "text-white/75 hover:bg-white/10 hover:text-white"
                              }`}
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
                    className="min-h-32 w-full resize-none rounded-xl border border-white/10 bg-black/15 p-4 text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/60 focus:bg-white/10"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
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
                          onChange={(e) => updateMcqOption(index, e.target.value)}
                        />

                        {option.isCorrect && (
                          <span className="rounded-full bg-blue-400/15 px-2.5 py-1 text-xs font-semibold text-blue-200">
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
                            ? "border-blue-400/40 bg-blue-500/10"
                            : "border-white/10 bg-black/15 hover:bg-white/5"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={trueFalseCorrect === "TRUE"}
                          onChange={() => setTrueFalseCorrect("TRUE")}
                          className="h-4 w-4 cursor-pointer accent-blue-500"
                        />
                        <span>Verdadero</span>
                      </label>

                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                          trueFalseCorrect === "FALSE"
                            ? "border-blue-400/40 bg-blue-500/10"
                            : "border-white/10 bg-black/15 hover:bg-white/5"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={trueFalseCorrect === "FALSE"}
                          onChange={() => setTrueFalseCorrect("FALSE")}
                          className="h-4 w-4 cursor-pointer accent-blue-500"
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
                  disabled={isPending}
                  className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="cursor-pointer rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}