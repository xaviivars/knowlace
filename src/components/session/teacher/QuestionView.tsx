"use client"

import { useState, useTransition } from "react"
import { submitAnswer } from "@/lib/actions/answer-actions"
import { getSocket } from "@/lib/socket"

type QuestionOption = {
  id: string
  content: string
  isCorrect: boolean
}

type QuestionWithOptions = {
  id: string
  content: string
  pageNumber: number
  options: QuestionOption[]
}

type QuestionViewProps = {
  question: QuestionWithOptions
  isOwner?: boolean
  onNext?: () => void
  participantId?: string 
}

export function QuestionView({
  question,
  isOwner = false,
  onNext,
  participantId,
}: QuestionViewProps) {

  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleAnswer(optionId: string) {
    if (isOwner) return
    if (!participantId) return
    if (answered) return

    startTransition(async () => {
      try {
        const result = await submitAnswer({
          participantId,
          questionId: question.id,
          optionId,
        })

        setSelected(optionId)
        setAnswered(true)

        if (result.correct) {
          alert("Correcta +100 puntos")
        } else {
          alert("Incorrecta")
        }

        const socket = getSocket()
        socket.emit("answer-submitted", {
          sessionId: result.sessionId,
        })

      } catch (err: any) {
        alert(err.message)
      }
    })
  }
  
  return (
    <div className="min-h-screen bg-[#0b162c] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-4xl space-y-10">

        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            {question.content}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {question.options.map((option) => (
            <button
              key={option.id}
              disabled={answered || isOwner || isPending}
              onClick={() => handleAnswer(option.id)}
              className={`
                p-6 rounded-2xl text-lg font-medium transition backdrop-blur-sm
                ${
                  selected === option.id
                    ? "bg-indigo-600"
                    : "bg-white/10 hover:bg-white/20"
                }
                ${answered ? "cursor-default" : ""}
              `}
            >
              {option.content}
            </button>
          ))}
        </div>

        {isOwner && onNext && (
          <div className="flex justify-center pt-6">
            <button
              onClick={onNext}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl font-semibold"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}