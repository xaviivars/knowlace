"use client"

import { useState, useTransition } from "react"
import { createQuestionAction } from "@/lib/actions/question-actions"
import { useRouter } from "next/navigation"

export default function CreateQuestionModal({
  sessionId,
}: {
  sessionId: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [content, setContent] = useState("")
  const [options, setOptions] = useState([
    { content: "", isCorrect: true },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ])

  function updateOption(index: number, value: string) {
    const newOptions = [...options]
    newOptions[index].content = value
    setOptions(newOptions)
  }

  function setCorrect(index: number) {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }))
    setOptions(newOptions)
  }

  function handleSubmit() {
    startTransition(async () => {
      await createQuestionAction({
        sessionId,
        content,
        options,
      })

      setIsOpen(false)
      setContent("")
      router.refresh()
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
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 text-white p-8 space-y-6 shadow-2xl border border-zinc-700">

            <h2 className="text-2xl font-bold">
              Nueva pregunta
            </h2>

            <textarea
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Escribe la pregunta..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={option.isCorrect}
                    onChange={() => setCorrect(index)}
                    className="accent-indigo-500"
                  />
                  <input
                    type="text"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Opción ${index + 1}`}
                    value={option.content}
                    onChange={(e) =>
                      updateOption(index, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
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