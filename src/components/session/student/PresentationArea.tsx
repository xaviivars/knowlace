"use client"

import dynamic from "next/dynamic"
import { QuestionView } from "@/components/session/teacher/QuestionView"

const PdfViewer = dynamic(() => import("../PdfViewer"), {
  ssr: false,
})

type QuestionWithOptions = {
  id: string
  content: string
  pageNumber: number
  options: {
    id: string
    content: string
    isCorrect: boolean
  }[]
}

type Props = {
  joined: boolean
  isActive: boolean
  name: string
  setName: (value: string) => void
  error: string | null
  onJoin: () => void

  accessCode: string
  pageNumber: number
  onPageChange: (page: number) => void

  questions: QuestionWithOptions[]
  participantId: string | null
  activeQuestionId: string | null
}

export default function PresentationArea({
  joined,
  isActive,
  name,
  setName,
  error,
  onJoin,

  accessCode,
  pageNumber,
  onPageChange,
  questions,
  participantId,
  activeQuestionId
}: Props) {

  const currentQuestion = questions.find(
    (q) =>
      q.pageNumber === pageNumber &&
      q.id === activeQuestionId
  )

  // No unido
  if (!joined) {
    return (
      <div className="flex-1 bg-[#0b162c] flex items-center justify-center">
        <div className="bg-[#142544] p-10 rounded-2xl shadow-2xl w-100 text-center">
          <h2 className="text-2xl font-semibold mb-6">
            Unirse a la sesión
          </h2>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 mb-4"
          />

          <button
            onClick={onJoin}
            className="w-full bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded"
          >
            Unirse
          </button>

          {error && (
            <div className="text-red-400 text-sm mt-4">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Unido pero esperando inicio
  if (joined && !isActive) {
    return (
      <div className="flex-1 bg-[#0b162c] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Esperando al profesor...
          </h2>
          <p className="text-white/60">
            La sesión comenzará en breve.
          </p>
        </div>
      </div>
    )
  }

  // Sesión activa → Mostrar PDF
  return (
    <div className="flex-1 min-h-screen bg-[#0b162c]">
      {currentQuestion ? (
        <QuestionView question={currentQuestion} participantId={participantId ?? undefined}/>
      ) : (
      <PdfViewer
        accessCode={accessCode}
        pageNumber={pageNumber}
        onPageChange={onPageChange}
        isOwner={false}
      />
      )}
    </div>
  )
}