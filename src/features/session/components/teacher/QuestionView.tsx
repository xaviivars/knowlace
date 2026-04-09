"use client"

import { useState, useTransition } from "react"
import { submitAnswer } from "@/features/answer/answer-actions"
import { getSocket } from "@/lib/socket"
import { QuestionWithOptions } from "@/features/question/question.types"
import confetti from "canvas-confetti"

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  })
}

type QuestionViewProps = {
  question: QuestionWithOptions
  isOwner?: boolean
  participantId?: string 
  remainingTime?: number
  isActive?: boolean
  stats?: {
    totalAnswers: number
    totalParticipants: number
  }
}

export function QuestionView({
  question,
  isOwner = false,
  participantId,
  remainingTime,
  isActive = false,
  stats
}: QuestionViewProps) {

  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect" | "info"
    message: string
  } | null>(null)
  const [shortAnswer, setShortAnswer] = useState("")

  function emitAnswerSubmitted() {
    const socket = getSocket()
    socket.emit("answer-submitted")
  }

  function clearFeedbackLater() {
    setTimeout(() => {
      setFeedback(null)
    }, 2500)
  }

  function handleOptionAnswer(optionId: string) {
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
          triggerConfetti()
          setFeedback({
            type: "correct",
            message: "🎉 ¡Correcta! +100"
          })
        } else {
          setFeedback({
            type: "incorrect",
            message: "❌ Incorrecta"
          })
        }

        clearFeedbackLater()
        
        if (remainingTime === 0) return

        emitAnswerSubmitted()

      } catch (err: any) {
        alert(err.message)
      }
    })
  }

  function handleShortAnswerSubmit() {
    if (isOwner) return
    if (!participantId) return
    if (answered) return
    if (!shortAnswer.trim()) return

    startTransition(async () => {
      try {
        await submitAnswer({
          participantId,
          questionId: question.id,
          textResponse: shortAnswer,
        })

        setAnswered(true)
        setFeedback({
          type: "info",
          message: "✅ Respuesta enviada"
        })

        clearFeedbackLater()

        if (remainingTime === 0) return

        emitAnswerSubmitted()
      } catch (err: any) {
        alert(err.message)
      }
    })
  }
  
  return (
    <div className="relative h-full w-full bg-[#0b162c] text-white flex items-center justify-center px-6">

      {feedback && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div
            className={`rounded-2xl px-8 py-5 text-3xl font-bold shadow-2xl backdrop-blur-sm animate-bounce ${
              feedback.type === "correct"
                ? "border border-green-400/40 bg-green-500/20 text-green-300"
                : feedback.type === "incorrect" 
                ? "border border-red-400/40 bg-red-500/20 text-red-300"
                : "border border-blue-400/40 bg-blue-500/20 text-blue-300"
            }`}
          >
            {feedback.message}
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl space-y-10">

        {isActive && remainingTime !== null && (
          <div className="absolute top-6 left-6 bg-black/40 px-4 py-2 rounded-xl text-lg font-semibold">
            ⏱ {remainingTime}s
          </div>
        )}

        {stats && (
          <div className="absolute top-20 right-6 bg-black/40 px-4 py-2 rounded-xl text-lg font-semibold">
            {stats.totalAnswers} / {stats.totalParticipants}
          </div>
        )}

        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            {question.content}
          </h2>

          {question.type === "SHORT_ANSWER" && (
            <p className="text-white/70">
              Escribe una respuesta breve. Esta pregunta no se corrige automáticamente.
            </p>
          )}
        </div>
        
        {question.type === "SHORT_ANSWER" ? (
          <div className="max-w-2xl mx-auto space-y-4">
            <textarea
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
              disabled={!isActive || answered || isOwner || isPending}
              placeholder="Escribe tu respuesta..."
              className="w-full min-h-35 rounded-2xl bg-white/10 border border-white/10 p-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />

            <button
              onClick={handleShortAnswerSubmit}
              disabled={!isActive || answered || isOwner || isPending || !shortAnswer.trim()}
              className="w-full p-4 rounded-2xl text-lg font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {answered ? "Respuesta enviada" : "Enviar respuesta"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {question.options.map((option) => (
              <button
                key={option.id}
                disabled={!isActive || answered || isOwner || isPending}
                onClick={() => handleOptionAnswer(option.id)}
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
        )}
      </div>
    </div>
    )
  }