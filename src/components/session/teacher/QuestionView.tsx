"use client"

import { useState, useTransition } from "react"
import { submitAnswer } from "@/features/answer/answer-actions"
import { getSocket } from "@/lib/socket"
import { QuestionWithOptions } from "@/features/question/question.types"

type QuestionViewProps = {
  question: QuestionWithOptions
  isOwner?: boolean
  participantId?: string 
  remainingTime?: number
  isActive?: boolean
}

export function QuestionView({
  question,
  isOwner = false,
  participantId,
  remainingTime,
  isActive = false
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
        
        if (remainingTime === 0) return
        
        const socket = getSocket()
        socket.emit("answer-submitted")

      } catch (err: any) {
        alert(err.message)
      }
    })
  }
  
  return (
    <div className="relative flex-1 bg-[#0b162c] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-4xl space-y-10">

        {isActive && remainingTime !== null && (
          <div className="absolute top-6 left-6 bg-black/40 px-4 py-2 rounded-xl text-lg font-semibold">
            ⏱ {remainingTime}s
          </div>
        )}

        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            {question.content}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {question.options.map((option) => (
            <button
              key={option.id}
              disabled={!isActive || answered || isOwner || isPending}
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
      </div>
    </div>
  )
}