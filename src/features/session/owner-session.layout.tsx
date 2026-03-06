"use client"

import SessionControls from "@/components/session/teacher/SessionControls"
import OwnerSessionPresentation from "@/features/session/OwnerSessionPresentation"
import { QuestionWithOptions } from "@/features/question/question.types"

export default function OwnerSessionLayout({
  sessionId,
  accessCode,
  title,
  description,
  isActive,
  initialPage,
  questions
}: {
  sessionId: string
  accessCode: string
  title: string
  description: string | null
  isActive: boolean
  initialPage: number
  questions: QuestionWithOptions[]
}) {

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0e1d38] text-white">

      <header className="border-b border-white/20 px-6 py-4">
        <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
          <p className="text-white/60">{description}</p>
          )}
      </header>

      <div className="flex items-center justify-between px-6 py-4">
        <SessionControls
          sessionId={sessionId}
          accessCode={accessCode}
          initialIsActive={isActive}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <OwnerSessionPresentation
          accessCode={accessCode}
          initialPage={initialPage}
          isOwner={true}
          questions={questions}
        />
      </div>

    </div>
  )
}