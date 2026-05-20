"use client"

import { useState, useTransition } from "react"
import { submitAnswer } from "@/features/answer/answer-actions"
import { getSocket } from "@/lib/socket"
import { QuestionWithOptions } from "@/features/question/question.types"
import confetti from "canvas-confetti"
import {
  ClockIcon,
  PencilSquareIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  })
}

type Props = {
  question: QuestionWithOptions
  participantId: string | null
  remainingTime: number | null
}

export default function StudentQuestionView({
  question,
  participantId,
  remainingTime,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect" | "info"
    message: string
  } | null>(null)
  const [shortAnswer, setShortAnswer] = useState("")

  const showTimer =
    remainingTime !== null && remainingTime !== undefined

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
            message: "¡Correcta! +100",
          })
        } else {
          setFeedback({
            type: "incorrect",
            message: "Incorrecta",
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
          message: "Respuesta enviada",
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
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0b162c] px-6 py-8 text-white">
      <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-8 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      {feedback && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <div
            className={`
              flex items-center gap-3 rounded-3xl border px-8 py-5
              text-2xl font-black shadow-2xl backdrop-blur-xl
              animate-[countdownPop_0.45s_ease-out]
              ${
                feedback.type === "correct"
                  ? "border-emerald-300/30 bg-emerald-500/15 text-emerald-200 shadow-emerald-950/20"
                  : feedback.type === "incorrect"
                    ? "border-red-300/30 bg-red-500/15 text-red-200 shadow-red-950/20"
                    : "border-blue-300/30 bg-blue-500/15 text-blue-200 shadow-blue-950/20"
              }
            `}
          >
            {feedback.type === "correct" && (
              <CheckCircleIcon className="h-8 w-8" />
            )}

            {feedback.type === "incorrect" && (
              <XCircleIcon className="h-8 w-8" />
            )}

            {feedback.type === "info" && (
              <PaperAirplaneIcon className="h-8 w-8" />
            )}

            {feedback.message}
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-full w-full max-w-5xl flex-col justify-center">
        {showTimer && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/7 px-4 py-2.5 shadow-lg shadow-black/10 backdrop-blur">
              <ClockIcon className="h-5 w-5 text-blue-300" />

              <span className="text-sm font-medium text-white/55">
                Tiempo restante
              </span>

              <span
                className={`font-mono text-xl font-black ${
                  remainingTime <= 5 ? "text-red-300" : "text-white"
                }`}
              >
                {remainingTime}s
              </span>
            </div>

            {answered && (
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200">
                Respuesta enviada
              </div>
            )}
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-[#142544]/75 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
              Pregunta
            </p>

            <h2 className="text-4xl font-black leading-tight tracking-tight text-white">
              {question.content}
            </h2>

            {question.type === "SHORT_ANSWER" && (
              <p className="mt-4 text-white/55">
                Escribe una respuesta breve. Esta pregunta no se corrige automáticamente.
              </p>
            )}
          </div>

          <div className="mt-10">
            {question.type === "SHORT_ANSWER" ? (
              <div className="mx-auto max-w-2xl space-y-4">
                <div className="rounded-3xl border border-white/10 bg-black/15 p-4">
                  <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-white/55">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-200">
                      <PencilSquareIcon className="h-5 w-5" />
                    </div>

                    Tu respuesta
                  </div>

                  <textarea
                    value={shortAnswer}
                    onChange={(e) => setShortAnswer(e.target.value)}
                    disabled={answered || isPending}
                    placeholder="Escribe tu respuesta..."
                    className="
                      min-h-36 w-full resize-none rounded-2xl
                      border border-white/10 bg-white/5
                      p-4 text-white outline-none
                      placeholder:text-white/35
                      transition
                      focus:border-blue-400/50
                      focus:bg-white/8
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />
                </div>

                <button
                  type="button"
                  onClick={handleShortAnswerSubmit}
                  disabled={answered || isPending || !shortAnswer.trim()}
                  className="
                    group
                    inline-flex w-full items-center justify-center gap-2
                    rounded-xl
                    cursor-pointer
                    border border-blue-300/20
                    bg-linear-to-r from-blue-400/15 to-cyan-300/10
                    px-5 py-3
                    text-sm font-semibold
                    text-blue-100
                    shadow-lg shadow-blue-950/10
                    transition
                    hover:border-blue-300/35
                    hover:from-blue-400/20
                    hover:to-cyan-300/15
                    hover:text-blue-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    active:scale-[0.98]
                  "
                >
                  <PaperAirplaneIcon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  {answered ? "Respuesta enviada" : "Enviar respuesta"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {question.options.map((option, index) => {
                  const isSelected = selected === option.id

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={answered || isPending}
                      onClick={() => handleOptionAnswer(option.id)}
                      className={`
                        group flex min-h-24 items-center gap-4 rounded-2xl border p-5
                        text-left shadow-lg shadow-black/10 backdrop-blur transition cursor-pointer
                        ${
                          isSelected
                            ? "border-blue-300/35 bg-blue-500/15 ring-1 ring-blue-300/20"
                            : "border-white/10 bg-white/4 hover:border-white/15 hover:bg-white/6"
                        }
                        ${answered && !isSelected ? "opacity-55" : ""}
                      `}
                    >
                      <div
                        className={`
                          flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl
                          text-sm font-black ring-1 transition
                          ${
                            isSelected
                              ? "bg-blue-400/20 text-blue-100 ring-blue-300/20"
                              : "bg-blue-500/10 text-blue-200 ring-blue-300/10"
                          }
                        `}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>

                      <p className="min-w-0 flex-1 wrap-break-word text-lg font-semibold leading-snug text-white/90">
                        {option.content}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}