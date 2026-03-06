"use client"

import { QuestionWithOptions } from "@/features/question/question.types"
import OwnerSessionLayout from "@/features/session/components/owner-session.layout"

export default function OwnerSessionContainer({
  sessionId,
  accessCode,
  title,
  description,
  initialIsActive,
  initialPage,
  questions
}: {
  sessionId: string
  accessCode: string
  title: string
  description: string | null
  initialIsActive: boolean
  initialPage: number
  questions: QuestionWithOptions[]
}) {

  return (
    <OwnerSessionLayout
      sessionId={sessionId}
      accessCode={accessCode}
      title={title}
      description={description}
      isActive={initialIsActive}
      initialPage={initialPage}
      questions={questions}
    />
  )
}