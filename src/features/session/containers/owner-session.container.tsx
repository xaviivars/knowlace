"use client"

import { QuestionWithOptions } from "@/features/question/question.types"
import OwnerSessionLayout from "@/features/session/owner-session.layout"

export default function OwnerSessionContainer({
  sessionId,
  accessCode,
  title,
  description,
  initialIsActive,
  initialSlideIndex,
  slides,
  pdfUrl
}: {
  sessionId: string
  accessCode: string
  title: string
  description: string | null
  initialIsActive: boolean
  initialSlideIndex: number
  slides: any[]
  pdfUrl: string
}) {

  return (
    <OwnerSessionLayout
      sessionId={sessionId}
      accessCode={accessCode}
      title={title}
      description={description}
      isActive={initialIsActive}
      initialSlideIndex={initialSlideIndex}
      slides={slides}
      pdfUrl={pdfUrl}
    />
  )
}